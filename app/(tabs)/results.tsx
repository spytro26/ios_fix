import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStorageContext } from '@/hooks/StorageProvider';
import { useGlobalUpdate } from '@/hooks/useGlobalUpdate';
import { calculateHeatLoad } from '@/utils/calculations';
import { generateAndSharePDF, PDFData } from '@/utils/pdfGenerator';

export default function ColdRoomResultsTab() {
  const { roomData, productData, miscData } = useStorageContext();

  // Subscribe to global updates for real-time calculation
  useGlobalUpdate();

  const results = calculateHeatLoad(roomData, productData, miscData);

  const handleSharePDF = async () => {
    const pdfData: PDFData = {
      title: 'Cold Room Heat Load Summary',
      subtitle: 'Key calculation results for cold room refrigeration system',
      finalResults: [
        { label: 'Total Load (with 20% Safety)', value: ((results.totalLoadKw || 0) * 1.2).toFixed(1), unit: 'kW' },
        { label: 'Base Load (without safety)', value: results.totalLoadKw?.toFixed(1) || '0.0', unit: 'kW' },
      ],
      inputs: [
        {
          title: 'Ambient Conditions',
          items: [
            { label: 'Ambient Temperature', value: miscData.ambientTemp?.toString() || '35', unit: `°${miscData.tempUnit || 'C'}` },
            { label: 'Ambient RH', value: '60', unit: '%' },
          ]
        },
        {
          title: 'Room Definition',
          items: [
            { label: 'Room Length', value: roomData.length?.toString() || '0', unit: roomData.lengthUnit || 'm' },
            { label: 'Room Width', value: roomData.width?.toString() || '0', unit: roomData.lengthUnit || 'm' },
            { label: 'Room Height', value: roomData.height?.toString() || '0', unit: roomData.lengthUnit || 'm' },
            { label: 'Insulation Thickness', value: roomData.wallInsulationThickness?.toString() || '100', unit: 'mm' },
            { label: 'Room Internal Volume', value: ((roomData.length || 0) * (roomData.width || 0) * (roomData.height || 0)).toFixed(2), unit: 'm³' },
            { label: 'Cold Room Position', value: 'Inside', unit: '' },
            { label: 'Room Temperature', value: miscData.roomTemp?.toString() || '2', unit: `°${miscData.tempUnit || 'C'}` },
            { label: 'Insulation', value: roomData.insulationType || 'PUF', unit: '40 kg/m³' },
          ]
        },
        {
          title: 'Product Definition',
          items: [
            { label: 'Product', value: productData.productName || 'Product', unit: '' },
            { label: 'Product Quantity', value: productData.massBeforeFreezing?.toString() || '1000', unit: productData.massUnit || 'kg' },
            { label: 'Daily Product Loading', value: productData.massBeforeFreezing?.toString() || '1000', unit: productData.massUnit || 'kg' },
            { label: 'Product Incoming Temp', value: productData.enteringTemp?.toString() || '30', unit: `°${productData.tempUnit || 'C'}` },
            { label: 'Product Final Temp', value: productData.finalTemp?.toString() || '4', unit: `°${productData.tempUnit || 'C'}` },
            { label: 'Specific Heat Above Freezing', value: productData.cpAboveFreezing?.toString() || '3.5', unit: 'kJ/kg °C' },
            { label: 'Specific Heat Below Freezing', value: productData.cpBelowFreezing?.toString() || '1.8', unit: 'kJ/kg °C' },
            { label: 'Freezing Temp', value: productData.freezingPoint?.toString() || '0', unit: `°${productData.tempUnit || 'C'}` },
            { label: 'Latent Heat of Freezing', value: '335', unit: 'kJ/kg' },
            { label: 'Respiration Heat', value: productData.watts?.toString() || '0.00', unit: 'W/kg' },
          ]
        },
        {
          title: 'Internal Factors',
          items: [
            { label: 'No. of Workers', value: miscData.occupancyCount?.toString() || '1', unit: '' },
            { label: 'Rated Power of motors', value: miscData.fanMotorRating?.toString() || '0.25', unit: 'kW' },
            { label: 'Lightings', value: miscData.lightPower?.toString() || '200', unit: 'W' },
            { label: 'Heater Coils', value: '0', unit: 'W' },
            { label: 'Working Time', value: '5', unit: 'h' },
            { label: 'Operating Time', value: miscData.equipmentUsageHours?.toString() || '20', unit: 'h' },
          ]
        }
      ],
      sections: [
        {
          title: 'Transmission Loads',
          items: [
            { label: 'Wall Load', value: ((results.wallLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Ceiling Load', value: ((results.ceilingLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Floor Load', value: ((results.floorLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Total Transmission Load', value: ((results.totalTransmissionLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
          ]
        },
        {
          title: 'Product Loads',
          items: [
            { label: 'Product Load', value: ((results.productLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Respiration Load', value: ((results.respirationLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
          ]
        },
        {
          title: 'Other Loads',
          items: [
            { label: 'Air Change Load', value: ((results.airChangeLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Equipment Load', value: ((results.equipmentLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Lighting Load', value: ((results.lightLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Door Heater Load', value: ((results.doorHeaterLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Occupancy Load', value: ((results.occupancyLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Total Miscellaneous Load', value: ((results.totalMiscLoad || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
          ]
        },
        {
          title: 'Heat Distribution',
          items: [
            { label: 'Sensible Heat', value: ((results.sensibleHeat || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Latent Heat', value: ((results.latentHeat || 0) / (24 * 3600)).toFixed(1), unit: 'kW' },
            { label: 'Sensible Heat Ratio', value: (results.sensibleHeatRatio || 0).toFixed(3), unit: '' },
            { label: 'Air Qty Required', value: (results.airQtyRequired || 0).toFixed(0), unit: 'CFM' },
          ]
        }
      ]
    };

    await generateAndSharePDF(pdfData);
  };

  const ResultCard = ({ title, value, unit, isHighlighted = false }: {
    title: string;
    value: number | undefined;
    unit: string;
    isHighlighted?: boolean;
  }) => (
    <View style={[styles.resultCard, isHighlighted && styles.highlightedCard]}>
      <Text style={[styles.resultLabel, isHighlighted && styles.highlightedLabel]}>{title}</Text>
      <Text style={[styles.resultValue, isHighlighted && styles.highlightedValue]}>
        {value !== undefined ? value.toFixed(1) : '0.0'} <Text style={styles.resultUnit}>{unit}</Text>
      </Text>
    </View>
  );

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Enzo Cool Calc</Text>
            <Text style={styles.subtitle}>Cold Room Heat Load Results</Text>

            {/* PDF Export Button */}
            <TouchableOpacity style={styles.pdfButton} onPress={handleSharePDF}>
              <Ionicons name="document-text-outline" size={20} color="#ffffff" />
              <Text style={styles.pdfButtonText}>Share as PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Main Results - Highlighted */}
          <SectionCard title="Main Results">
            <ResultCard
              title="Total Load (with 20% Safety)"
              value={results.totalLoadKw * 1.2}
              unit="kW"
              isHighlighted={true}
            />
            <ResultCard
              title="Base Load (without safety)"
              value={results.totalLoadKw}
              unit="kW"
              isHighlighted={true}
            />
          </SectionCard>

          {/* Transmission Loads */}
          <SectionCard title="Transmission Loads">
            <ResultCard title="Wall Load" value={results.wallLoad / (24 * 3600)} unit="kW" />
            <ResultCard title="Ceiling Load" value={results.ceilingLoad / (24 * 3600)} unit="kW" />
            <ResultCard title="Floor Load" value={results.floorLoad / (24 * 3600)} unit="kW" />
            <ResultCard
              title="Total Transmission Load"
              value={results.totalTransmissionLoad / (24 * 3600)}
              unit="kW"
            />
          </SectionCard>

          {/* Product Loads */}
          <SectionCard title="Product Loads">
            <ResultCard title="Product Load" value={results.productLoad / (24 * 3600)} unit="kW" />
            <ResultCard title="Respiration Load" value={results.respirationLoad / (24 * 3600)} unit="kW" />
            <ResultCard title="Total Product Load" value={results.productLoad / (24 * 3600)} unit="kW" />
          </SectionCard>

          {/* Other Loads */}
          <SectionCard title="Other Loads">
            <ResultCard title="Air Change Load" value={results.airChangeLoad / (24 * 3600)} unit="kW" />
            <ResultCard title="Equipment Load" value={results.equipmentLoad / (24 * 3600)} unit="kW" />
            <ResultCard title="Lighting Load" value={results.lightLoad / (24 * 3600)} unit="kW" />
            <ResultCard title="Door Heater Load" value={results.doorHeaterLoad / (24 * 3600)} unit="kW" />
            <ResultCard title="Occupancy Load" value={results.occupancyLoad / (24 * 3600)} unit="kW" />
            <ResultCard
              title="Total Miscellaneous Load"
              value={results.totalMiscLoad / (24 * 3600)}
              unit="kW"
            />
          </SectionCard>

          {/* Heat Distribution */}
          <SectionCard title="Heat Distribution">
            <ResultCard title="Sensible Heat" value={results.sensibleHeat / (24 * 3600)} unit="kW" />
            <ResultCard title="Latent Heat" value={results.latentHeat / (24 * 3600)} unit="kW" />
            <ResultCard title="Sensible Heat Ratio" value={results.sensibleHeatRatio} unit="" />
            <ResultCard title="Air Quantity Required" value={results.airQtyRequired} unit="CFM" />
          </SectionCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Enzo</Text>
            <Text style={styles.footerSubtext}>
              Professional cold room heat load calculations following ASHRAE standards
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 12,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '400',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pdfButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 10,
    letterSpacing: -0.1,
    textAlign: 'left',
  },
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 40,
  },
  highlightedCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 3,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  resultLabel: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    fontWeight: '400',
  },
  highlightedLabel: {
    fontWeight: '600',
    color: '#1e40af',
    fontSize: 14,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  highlightedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  resultUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748b',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 3,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '400',
  },
});