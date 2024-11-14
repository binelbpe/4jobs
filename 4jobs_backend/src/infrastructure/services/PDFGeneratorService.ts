import PDFDocument from "pdfkit";
import { ResumeData } from "../../domain/entities/resumeTypes";

export const generatePDF = (resumeData: ResumeData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 30,
        bottom: 30,
        left: 50,
        right: 50,
      },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 100;
    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .text(resumeData.fullName.toUpperCase(), { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`${resumeData.phone} — ${resumeData.email}`, { align: "center" });


    const addSectionHeader = (text: string) => {
      doc.moveDown(1);
      doc.fontSize(14).font("Helvetica-Bold").text(text.toUpperCase());
      doc.moveDown(0.2);
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.x + contentWidth, doc.y)
        .lineWidth(1)
        .stroke();
      doc.moveDown(0.5);
    };


    const addSectionIfContent = (
      title: string,
      content: any,
      renderContent: () => void
    ) => {
      if (
        content &&
        (Array.isArray(content)
          ? content.length > 0
          : Object.keys(content).length > 0)
      ) {
        addSectionHeader(title);
        renderContent();
      }
    };


    const addBulletPoint = (text: string) => {
      doc.fontSize(10).font("Helvetica");
      doc.list([text], { bulletRadius: 1.5, textIndent: 10 });
    };


    doc.moveDown(2);


    if (resumeData.profileSummary) {
      addSectionHeader("Professional Summary");
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(resumeData.profileSummary, { align: "justify" });
    }

  
    addSectionIfContent("Skills", resumeData.skills, () => {
      const skillsText = resumeData.skills.join(" • ");
      doc.fontSize(10).font("Helvetica").text(skillsText, {
        align: "justify",
        continued: false,
      });
      doc.moveDown(0.5);
    });

    addSectionIfContent(
      "Professional Experience",
      resumeData.experience,
      () => {
        resumeData.experience.forEach((exp) => {
          doc.fontSize(12).font("Helvetica-Bold").text(exp.position);
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`);
          doc.moveDown(0.3);
          exp.description
            .split("\n")
            .forEach((line) => addBulletPoint(line.trim()));
          doc.moveDown(0.5);
        });
      }
    );

 
    addSectionIfContent("Key Projects", resumeData.projects, () => {
      resumeData.projects.forEach((project) => {
        doc.fontSize(12).font("Helvetica-Bold").text(project.name);
        addBulletPoint(project.description);
        addBulletPoint(`Technologies: ${project.technologies.join(", ")}`);
        if (project.link) {
          addBulletPoint(`Link: ${project.link}`);
        }
        doc.moveDown(0.5);
      });
    });

    
    addSectionIfContent("Education", resumeData.education, () => {
      resumeData.education.forEach((edu) => {
        doc.fontSize(12).font("Helvetica-Bold").text(edu.degree);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`${edu.institution} | ${edu.field}`);
        doc.fontSize(10).font("Helvetica").text(edu.graduationDate);
        doc.moveDown(0.5);
      });
    });


    addSectionHeader("Declaration");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "I hereby declare that all the information furnished above is true and correct to the best of my knowledge."
      );
    doc.moveDown(0.5);
    doc.text(`- ${resumeData.fullName}`, { align: "right" });

    doc.end();
  });
};
