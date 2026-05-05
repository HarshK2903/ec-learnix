import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs';

async function main() {
// Sample blog post content (unformatted, messy - perfect for testing)
const doc = new Document({
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun("Why Machine Learning is Changing Everything")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Machine learning has become one of the most talked about technologies in recent years. From self-driving cars to recommendation systems, ML is everywhere. But what exactly is it and why should you care?")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("At its core machine learning is a subset of artificial intelligence that allows computers to learn from data without being explicitly programmed. Instead of writing rules for every scenario, you feed the algorithm data and it figures out the patterns on its own. This is incredibly powerful because it means we can solve problems that would be impossible to code manually.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Consider healthcare. Doctors spend years learning to read X-rays and MRIs. A machine learning model can be trained on millions of medical images and achieve diagnostic accuracy that rivals or even exceeds human experts. This doesnt mean doctors are being replaced. It means they get a powerful assistant that can catch things they might miss.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("In finance ML algorithms analyze market data patterns and make predictions about stock prices. They detect fraudulent transactions in milliseconds. Banks use them to assess credit risk more accurately than traditional methods.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("The real game changer is natural language processing. Models like GPT can understand and generate human language with remarkable fluency. This has opened up possibilities in customer service, content creation, translation, and much more.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("However there are challenges. ML models need massive amounts of data to train. They can perpetuate biases present in training data. They require significant computational resources. And explaining why a model made a particular decision can be difficult.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Despite these challenges the future of machine learning looks incredibly bright. As hardware improves and techniques advance we will see ML integrated into virtually every industry. The question is not whether ML will transform your field but when.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("By Rohan")] }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("test_blogpost.docx", buffer);
console.log("✅ Created: test_blogpost.docx");

// Sample CV content
const cvDoc = new Document({
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun("Priya Sharma")] }),
      new Paragraph({ children: [new TextRun("Email: priya.sharma@email.com | Phone: +91-9876543210")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Education")] }),
      new Paragraph({ children: [new TextRun("B.Tech Computer Science - IIT Delhi, 2022")] }),
      new Paragraph({ children: [new TextRun("Class XII - DPS RK Puram, 2018, 95.4%")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Experience")] }),
      new Paragraph({ children: [new TextRun("Software Engineer at Google, Jan 2023 - Present")] }),
      new Paragraph({ children: [new TextRun("worked on search ranking algorithms and improved latency by 15%")] }),
      new Paragraph({ children: [new TextRun("built microservices using Go and deployed on kubernetes")] }),
      new Paragraph({ children: [new TextRun("mentored 3 junior engineers")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Intern at Microsoft, May 2022 - Dec 2022")] }),
      new Paragraph({ children: [new TextRun("developed azure devops pipeline tools")] }),
      new Paragraph({ children: [new TextRun("fixed 40+ bugs in production code")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Skills")] }),
      new Paragraph({ children: [new TextRun("Python, Java, Go, JavaScript, React, Node.js, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Git")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Projects")] }),
      new Paragraph({ children: [new TextRun("AI Chatbot - Built a customer support chatbot using NLP that handled 500+ queries daily")] }),
      new Paragraph({ children: [new TextRun("E-commerce Platform - Full stack app with payment integration serving 10k users")] }),
    ],
  }],
});

const cvBuffer = await Packer.toBuffer(cvDoc);
fs.writeFileSync("test_resume.docx", cvBuffer);
console.log("✅ Created: test_resume.docx");

// Sample journal paper
const journalDoc = new Document({
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun("Title: A Novel Approach to Real-Time Object Detection Using Lightweight Neural Networks")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Authors: Harsh Kumar, Priya Sharma")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Abstract")] }),
      new Paragraph({ children: [new TextRun("This paper presents a novel approach to real-time object detection using lightweight neural networks optimized for edge devices. We propose a modified MobileNet architecture that achieves 94.2% accuracy on the COCO dataset while maintaining inference speeds below 30ms on mobile hardware. Our method reduces model size by 60% compared to YOLOv5 without significant accuracy loss.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Keywords: object detection, neural networks, edge computing, MobileNet, real-time inference")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Introduction")] }),
      new Paragraph({ children: [new TextRun("Object detection is a fundamental problem in computer vision with applications ranging from autonomous driving to surveillance. While deep learning models have achieved remarkable accuracy, most state-of-the-art detectors require significant computational resources making them unsuitable for deployment on edge devices such as smartphones and IoT sensors.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Recent works have focused on model compression techniques including knowledge distillation pruning and quantization. However these methods often result in significant accuracy degradation. In this paper we propose a novel architecture that is inherently lightweight while maintaining competitive accuracy.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Methodology")] }),
      new Paragraph({ children: [new TextRun("We build upon the MobileNetV3 backbone and introduce a Feature Pyramid Attention module that selectively focuses on the most informative features at each scale. Our training procedure uses a combination of focal loss and CIoU loss. We train on COCO train2017 with standard augmentation including random crop flip and color jitter.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("Results")] }),
      new Paragraph({ children: [new TextRun("Our model achieves 94.2% mAP@0.5 on COCO val2017 with only 3.2M parameters. Inference time on a Snapdragon 888 is 28ms per frame. Compared to YOLOv5s our model is 60% smaller and 20% faster while only 1.8% lower in accuracy. On the Pascal VOC dataset we achieve 96.1% mAP.")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("References")] }),
      new Paragraph({ children: [new TextRun("[1] Howard et al. MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications. 2017")] }),
      new Paragraph({ children: [new TextRun("[2] Redmon et al. You Only Look Once: Unified Real-Time Object Detection. CVPR 2016")] }),
      new Paragraph({ children: [new TextRun("[3] Lin et al. Feature Pyramid Networks for Object Detection. CVPR 2017")] }),
    ],
  }],
});

const journalBuffer = await Packer.toBuffer(journalDoc);
fs.writeFileSync("test_journal.docx", journalBuffer);
console.log("✅ Created: test_journal.docx");
}

main().catch(console.error);
