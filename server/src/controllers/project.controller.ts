import { Response } from 'express';
import mongoose from 'mongoose';
import mammoth from 'mammoth';
import HTMLtoDOCX from 'html-to-docx';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { ProjectModel } from '../models/Project.js';

// Create a new project
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, templateType } = req.body;

    const project = await ProjectModel.create({
      userId: req.userId,
      title: title || 'Untitled Project',
      content: content || '',
      templateType: templateType || null,
    });

    res.status(201).json({
      project: {
        _id: project._id,
        title: project.title,
        content: project.content,
        templateType: project.templateType,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

// List all projects (not deleted)
export const listProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await ProjectModel.find({
      userId: req.userId,
      isDeleted: false,
    })
      .select('title templateType createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

// List trashed projects
export const listTrash = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await ProjectModel.find({
      userId: req.userId,
      isDeleted: true,
    })
      .select('title templateType deletedAt createdAt')
      .sort({ deletedAt: -1 })
      .lean();

    res.json({ projects });
  } catch (error) {
    console.error('List trash error:', error);
    res.status(500).json({ message: 'Failed to fetch trash' });
  }
};

// Get single project
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const project = await ProjectModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({
      project: {
        _id: project._id,
        title: project.title,
        content: project.content,
        templateType: project.templateType,
        isDeleted: project.isDeleted,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

// Update project (title and/or content)
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const { title, content } = req.body;
    const update: Record<string, any> = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;

    const project = await ProjectModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, isDeleted: false },
      { $set: update },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({
      project: {
        _id: project._id,
        title: project.title,
        content: project.content,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
};

// Soft delete (move to trash)
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const project = await ProjectModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({ message: 'Project moved to trash' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

// Restore from trash
export const restoreProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const project = await ProjectModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found in trash' });
      return;
    }

    res.json({ message: 'Project restored' });
  } catch (error) {
    console.error('Restore project error:', error);
    res.status(500).json({ message: 'Failed to restore project' });
  }
};

// Permanent delete
export const permanentDeleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const result = await ProjectModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: true,
    });

    if (!result) {
      res.status(404).json({ message: 'Project not found in trash' });
      return;
    }

    res.json({ message: 'Project permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ message: 'Failed to permanently delete project' });
  }
};

// Import DOCX as a new project (upload → extract HTML → create project)
export const importProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;

    // Convert DOCX to HTML using mammoth
    const result = await mammoth.convertToHtml({ path: filePath });
    const htmlContent = result.value;

    // Use original filename (without extension) as project title
    const originalName = req.file.originalname || 'Imported Document';
    const title = path.basename(originalName, path.extname(originalName));

    // Create the project with the extracted content
    const project = await ProjectModel.create({
      userId: req.userId,
      title,
      content: htmlContent,
      templateType: null,
    });

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore cleanup errors
    }

    res.status(201).json({
      project: {
        _id: project._id,
        title: project.title,
        content: project.content,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error('Import project error:', error);
    res.status(500).json({ message: 'Failed to import document' });
  }
};

// Export project as DOCX
export const exportProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const project = await ProjectModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const htmlContent = project.content || '<p></p>';

    // Wrap in basic HTML structure for better conversion
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlContent}</body></html>`;

    const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    const filename = `${project.title.replace(/[^a-zA-Z0-9\s-]/g, '').trim() || 'document'}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(docxBuffer as ArrayBuffer));
  } catch (error) {
    console.error('Export project error:', error);
    res.status(500).json({ message: 'Failed to export project' });
  }
};
