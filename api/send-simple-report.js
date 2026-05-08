import { Resend } from 'resend';
import { render } from '@react-email/render';
import { SimpleReportEmail } from '../../emails/SimpleReportEmail';
import { generateReportPDF } from '../../utils/pdfGenerator';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { participantEmail, participantName, testType, results, testDate } = req.body;

  try {
    // 1. Gerar PDF Premium
    const pdfBuffer = await generateReportPDF({ participantName, testType, results, testDate });

    // 2. Renderizar E-mail
    const emailHtml = render(SimpleReportEmail({ 
      name: participantName, 
      testType, 
      results, 
      testDate 
    }));

    // 3. Disparar E-mail com PDF em anexo
    await resend.emails.send({
      from: 'Vigorre <relatorios@seudominio.com>',
      to: participantEmail,
      subject: `Seu Relatório Comportamental Vigorre está pronto 📊`,
      html: emailHtml,
      attachments: [{ filename: `Relatorio-Simples-${testType}.pdf`, content: pdfBuffer }]
    });

    // 4. Salvar histórico (exemplo com DB ou localStorage em dev)
    // await db.reports.create({ participantEmail, testType, status: 'sent', date: new Date() });

    return res.status(200).json({ success: true, message: 'Relatório enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar relatório:', error);
    return res.status(500).json({ error: 'Falha ao gerar/enviar relatório' });
  }
}
