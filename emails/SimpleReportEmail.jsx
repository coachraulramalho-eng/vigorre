import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Button, Hr, Row, Column } from '@react-email/components';

export function SimpleReportEmail({ name, testType, results, testDate }) {
  const primaryColor = '#1D4ED8';
  const secondaryColor = '#7C3AED';
  
  return (
    <Html>
      <Head />
      <Preview>Seu Relatório Comportamental Vigorre foi gerado com sucesso.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* HEADER */}
          <Section style={header}>
            <Img src="https://seudominio.com/logo-vigorre.png" width="120" alt="Vigorre" />
            <Text style={headerTitle}>People Analytics • Assessment Comportamental</Text>
          </Section>

          {/* SAUDAÇÃO */}
          <Section style={content}>
            <Heading style={h1}>Olá, {name} 👋</Heading>
            <Text style={text}>
              Seu <strong>Relatório Simples Vigorre</strong> ({testType}) foi concluído com sucesso.
              Abaixo, um resumo executivo da sua análise comportamental.
            </Text>

            {/* MINI DASHBOARD */}
            <Section style={dashboard}>
              <Row>
                <Column style={metricBox}>
                  <Text style={metricLabel}>Perfil Predominante</Text>
                  <Text style={metricValue}>{results.dominantProfile}</Text>
                </Column>
                <Column style={metricBox}>
                  <Text style={metricLabel}>Score Geral</Text>
                  <Text style={metricValue}>{results.score}%</Text>
                </Column>
              </Row>
              <Row style={{ marginTop: 12 }}>
                <Column>
                  <Text style={summaryText}>
                    "{results.quickInsight}"
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            {/* CTAs */}
            <Section style={ctaSection}>
              <Button style={primaryBtn} href="https://seudominio.com/relatorio-view?token=xyz">
                📄 Visualizar Relatório Completo
              </Button>
              <Button style={secondaryBtn} href="https://seudominio.com/baixar-pdf?token=xyz">
                ⬇️ Baixar PDF Premium
              </Button>
            </Section>

            <Hr style={divider} />

            {/* UPGRADE CONVERSION */}
            <Section style={upgradeBox}>
              <Heading style={upgradeTitle}>🚀 Quer descobrir sua Análise Completa?</Heading>
              <Text style={upgradeText}>
                Desbloqueie insights profundos de inteligência emocional, fit cultural, 
                perfil de liderança e recomendações estratégicas personalizadas.
              </Text>
              <ul style={upgradeList}>
                <li>✅ Radar comportamental avançado</li>
                <li>✅ Compatibilidade com vagas e liderança</li>
                <li>✅ People Analytics & Riscos comportamentais</li>
                <li>✅ Laudo técnico para RH e gestores</li>
              </ul>
              <Button style={upgradeBtn} href="https://seudominio.com/upgrade-premium">
                🔓 DESBLOQUEAR RELATÓRIO PREMIUM
              </Button>
            </Section>
          </Section>

          {/* FOOTER */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 Vigorre People Analytics. Todos os direitos reservados.<br/>
              Este e-mail foi enviado automaticamente após conclusão do assessment.
            </Text>
            <Link href="https://seudominio.com/unsubscribe" style={footerLink}>Cancelar inscrição</Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos inline (email-safe)
const main = { backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' };
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };
const header = { padding: '24px', backgroundColor: '#0f172a', textAlign: 'center' };
const headerTitle = { color: '#94a3b8', fontSize: '12px', marginTop: '8px' };
const content = { padding: '32px 24px' };
const h1 = { color: '#1e293b', fontSize: '24px', marginBottom: '16px' };
const text = { color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' };
const dashboard = { backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '10px', marginBottom: '20px' };
const metricBox = { width: '50%', textAlign: 'center' };
const metricLabel = { color: '#64748b', fontSize: '12px', marginBottom: '4px' };
const metricValue = { color: '#0f172a', fontSize: '20px', fontWeight: 'bold' };
const summaryText = { color: '#334155', fontSize: '14px', fontStyle: 'italic', textAlign: 'center' };
const divider = { borderColor: '#e2e8f0', margin: '24px 0' };
const ctaSection = { textAlign: 'center' };
const primaryBtn = { backgroundColor: '#1D4ED8', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginRight: '12px' };
const secondaryBtn = { backgroundColor: '#f8fafc', color: '#1e293b', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'inline-block', border: '1px solid #cbd5e1' };
const upgradeBox = { backgroundColor: '#eff6ff', padding: '24px', borderRadius: '10px', border: '1px solid #bfdbfe' };
const upgradeTitle = { color: '#1e40af', fontSize: '18px', marginBottom: '12px' };
const upgradeText = { color: '#334155', fontSize: '14px', lineHeight: '1.6' };
const upgradeList = { color: '#334155', fontSize: '14px', paddingLeft: '20px', margin: '16px 0' };
const upgradeBtn = { backgroundColor: '#7C3AED', color: '#fff', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', display: 'inline-block', marginTop: '12px' };
const footer = { padding: '24px', textAlign: 'center', backgroundColor: '#f8fafc' };
const footerText = { color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' };
const footerLink = { color: '#64748b', fontSize: '12px', textDecoration: 'underline' };
