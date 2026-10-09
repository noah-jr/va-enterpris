import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateContractPDF = (clientName: string, service: string, amount: number) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.text("Contrato de Prestação de Serviços", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text("VA TECH ENTERPRISES", 105, 30, { align: "center" });

    // Details
    doc.setFontSize(12);
    doc.text(`Cliente: ${clientName}`, 20, 50);
    doc.text(`Serviço: ${service}`, 20, 60);
    doc.text(`Valor: ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(amount)}`, 20, 70);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-PT')}`, 20, 80);

    // Body
    doc.text("Cláusula 1. Objeto", 20, 100);
    doc.setFontSize(10);
    const text1 = "O presente contrato tem como objeto a prestação dos serviços acima descritos pela VA TECH à entidade Contratante.";
    const splitText1 = doc.splitTextToSize(text1, 170);
    doc.text(splitText1, 20, 107);

    doc.setFontSize(12);
    doc.text("Cláusula 2. Condições de Pagamento", 20, 125);
    doc.setFontSize(10);
    const text2 = "O pagamento deve ser efetuado 50% na adjudicação e 50% na entrega. O não cumprimento pode acarretar juros.";
    const splitText2 = doc.splitTextToSize(text2, 170);
    doc.text(splitText2, 20, 132);

    // Signatures
    doc.text("__________________________", 30, 200);
    doc.text("VA TECH ENTERPRISES", 30, 210);

    doc.text("__________________________", 120, 200);
    doc.text("Cliente", 120, 210);

    return Buffer.from(doc.output('arraybuffer'));
};

export const generateInvoicePDF = (clientName: string, items: { desc: string, qty: number, price: number }[]) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Fatura Pró-forma", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Cliente: ${clientName}`, 20, 40);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 20, 46);

    const tableData = items.map(item => [item.desc, item.qty, item.price, item.qty * item.price]);

    (doc as any).autoTable({
        startY: 60,
        head: [['Descrição', 'Qtd', 'Preço Unit.', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
    });

    const total = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    doc.text(`Total: ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(total)}`, 140, (doc as any).lastAutoTable.finalY + 10);

    return Buffer.from(doc.output('arraybuffer'));
};
