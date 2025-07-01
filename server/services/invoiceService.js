import path from "path";
import PDFDocument from "pdfkit";

export const createInvoicePDF = async (order) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));

  generateHeader(doc);
  generateCustomerInformation(doc, order);
  const finalY = generateInvoiceTable(doc, order);
  generateFooter(doc, finalY);

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });
};

function generateHeader(doc) {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const logoPath = path.join(__dirname, "..", "assets", "kitchenly-no-bg.png");

  // Logo positioned on the left with proper sizing
  try {
    doc.image(logoPath, 50, 45, { width: 60, height: 40 });
  } catch (error) {
    console.log('Logo not found, continuing without logo');
  }

  // Company name positioned next to logo
  doc
    .fillColor('#2c3e50')
    .fontSize(18)
    .font('Helvetica-Bold')
    .text("KITCHENLY", 120, 50)
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#666666')
    .text("Luxury Home Appliances", 120, 70);

  // Company contact info on the right
  doc
    .fillColor('#333333')
    .fontSize(9)
    .font('Helvetica')
    .text("1 rue ernest renan", 400, 45, { align: "right" })
    .text("92130 Issy-Les-Moulineaux, France", 400, 58, { align: "right" })
    .text("kitchenly.contact@gmail.com", 400, 71, { align: "right" })
    .text("Tél: +33 6 76 18 25 24", 400, 84, { align: "right" });

  // Header separator line
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, 110)
    .lineTo(550, 110)
    .stroke();
}

function generateCustomerInformation(doc, order) {
  doc
    .fillColor('#2c3e50')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text("FACTURE", 50, 130);

  const invoiceInfoY = 165;

  doc
    .fillColor('#333333')
    .fontSize(10)
    .font('Helvetica')
    .text("Numéro :", 50, invoiceInfoY)
    .font('Helvetica-Bold')
    .text(`FAC-${order.orderUnique}`, 120, invoiceInfoY)
    .font('Helvetica')
    .text("Date :", 50, invoiceInfoY + 15)
    .font('Helvetica-Bold')
    .text(formatDate(new Date()), 120, invoiceInfoY + 15)
    .font('Helvetica')
    .text("Échéance :", 50, invoiceInfoY + 30)
    .font('Helvetica-Bold')
    .text(formatDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)), 120, invoiceInfoY + 30);

  doc
    .fillColor('#2c3e50')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text("FACTURER À:", 320, invoiceInfoY - 10)
    .fillColor('#333333')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`${order.firstname} ${order.lastname}`, 320, invoiceInfoY + 10)
    .font('Helvetica')
    .text(order.email, 320, invoiceInfoY + 25)
    .text(order.address || "Adresse non fournie", 320, invoiceInfoY + 40)
    .text(`${order.postalCode || ""} ${order.city || ""}`.trim(), 320, invoiceInfoY + 55)
    .text(order.country || "", 320, invoiceInfoY + 70);

  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, 255)
    .lineTo(550, 255)
    .stroke();
}

function generateInvoiceTable(doc, order) {
  const products = order.products || [];
  const tableTop = 275;

  // En-têtes
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#2c3e50')
    .text("Produit", 50, tableTop, { width: 100 })
    .text("Description", 150, tableTop, { width: 180 })
    .text("Prix Unitaire", 340, tableTop, { width: 70, align: "right" })
    .text("Quantité", 420, tableTop, { width: 60, align: "center" })
    .text("Total", 480, tableTop, { width: 70, align: "right" });

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .strokeColor("#aaaaaa")
    .stroke();

  let y = tableTop + 25;

  for (const item of products) {
    const title = item.product?.product_title || 'Produit';
    const description = item.product?.product_description || '';
    const price = item.product?.product_price || 0;
    const quantity = item.quantity || 1;
    const total = item.amount || 0;

    const titleHeight = doc.heightOfString(title, { width: 100 });
    const descHeight = doc.heightOfString(description, { width: 180 });
    const rowHeight = Math.max(titleHeight, descHeight, 20);

    if (y + rowHeight > 720) {
      doc.addPage();
      y = 50;
    }

    // Texte
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#333333')
      .text(title, 50, y, { width: 100 });

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#666666')
      .text(description, 150, y, { width: 180 });

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#333333')
      .text(formatCurrency(price), 340, y, { width: 70, align: "right" })
      .text(quantity.toString(), 420, y, { width: 60, align: "center" })
      .text(formatCurrency(total), 480, y, { width: 70, align: "right" });

    // Ligne de séparation
    y += rowHeight + 5;
    doc
      .moveTo(50, y - 3)
      .lineTo(550, y - 3)
      .strokeColor("#eeeeee")
      .lineWidth(0.5)
      .stroke();
  }

  // Add totals section
  const subtotal = calculateSubtotal(products);
  const totalY = y + 30;

  // White background box for totals
  doc
    .rect(350, totalY - 10, 200, 50)
    .fillColor('#f8f9fa')
    .fill()
    .strokeColor('#dee2e6')
    .lineWidth(1)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#333333')
    .text("SOUS-TOTAL", 360, totalY, { width: 120 })
    .text(formatCurrency(subtotal), 480, totalY, { width: 60, align: "right" });

  // Bold line above total
  doc
    .strokeColor("#2c3e50")
    .lineWidth(1)
    .moveTo(360, totalY + 18)
    .lineTo(540, totalY + 18)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor('#2c3e50')
    .text("TOTAL TTC", 360, totalY + 22, { width: 120 })
    .text(formatCurrency(subtotal), 480, totalY + 22, { width: 60, align: "right" });

  return totalY + 40;
}


function generateFooter(doc, startY) {
  const footerY = Math.max(startY + 30, 650); // Ensure footer has enough space
  
  doc
    .fillColor('#666666')
    .fontSize(9)
    .font('Helvetica')
    .text("CONDITIONS DE PAIEMENT :", 50, footerY)
    .text("• Paiement dû dans les 15 jours suivant la date de facture", 50, footerY + 15)
    .text("• Paiement par carte bancaire ou virement SEPA", 50, footerY + 30)
    .text("• En cas de retard, pénalités de 3x le taux légal", 50, footerY + 45)
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#2c3e50')
    .text("Merci pour votre confiance !", 50, footerY + 70, { align: "center", width: 500 });
}

function calculateSubtotal(products) {
  return products.reduce((sum, item) => sum + (item.amount || 0), 0);
}

function formatCurrency(value) {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  return `${numValue.toFixed(2)} €`;
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
