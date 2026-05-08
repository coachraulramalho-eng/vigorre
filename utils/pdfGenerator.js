import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' });

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottom: '1px solid #e2e8f0', paddingBottom: 15 },
  title: { fontSize: 22, color: '#1e293b', fontWeight: 'bold' },
  subtitle: { fontSize: 12, color: '#64748b' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1D4ED8', marginBottom: 8 },
  text: { fontSize: 11, color: '#334155', lineHeight: 1.5 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metric: { fontSize: 11, color: '#475569' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 10, color: '#94a3b8' }
});

export const generateReportPDF = async ({ participantName, testType, results, testDate }) => {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatório Simples Vigorre</Text>
            <Text style={styles.subtitle}>{testType} • {testDate}</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#64748b' }}>{participantName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Resumo Executivo</Text>
          <Text style={styles.text}>{results.quickInsight}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Métricas Principais</Text>
          <View style={styles.metricRow}><Text style={styles.metric}>Perfil Predominante:</Text><Text style={styles.metric}>{results.dominantProfile}</Text></View>
          <View style={styles.metricRow}><Text style={styles.metric}>Score Geral:</Text><Text style={styles.metric}>{results.score}%</Text></View>
          <View style={styles.metricRow}><Text style={styles.metric}>Teste Concluído:</Text><Text style={styles.metric}>{testDate}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Próximo Passo</Text>
          <Text style={styles.text}>
            Este relatório contém uma visão inicial do seu perfil. 
            Para acesso à análise completa, fit cultural e laudo técnico, 
            acesse sua área de participante e desbloqueie o pacote Premium.
          </Text>
        </View>

        <Text style={styles.footer}>© 2024 Vigorre People Analytics • Documento gerado automaticamente</Text>
      </Page>
    </Document>
  );

  return await doc.toBuffer();
};
