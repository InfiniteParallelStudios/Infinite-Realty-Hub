import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-native-qrcode-svg';

interface QRData {
  name: string;
  phone: string;
  email: string;
  company: string;
  website: string;
  notes: string;
}

const QR_TYPES = [
  { id: 'contact', name: 'Contact Info', icon: '👤' },
  { id: 'website', name: 'Website', icon: '🌐' },
  { id: 'email', name: 'Email', icon: '📧' },
  { id: 'phone', name: 'Phone', icon: '📞' },
  { id: 'text', name: 'Plain Text', icon: '📝' },
];

export default function QRGeneratorScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('contact');
  const [qrData, setQrData] = useState<QRData>({
    name: user?.user_metadata?.full_name || '',
    phone: '',
    email: user?.email || '',
    company: '',
    website: '',
    notes: '',
  });
  const [customText, setCustomText] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const qrRef = useRef<any>();

  const screenWidth = Dimensions.get('window').width;
  const qrSize = Math.min(screenWidth - 64, 280);

  const generateVCard = () => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${qrData.name}
ORG:${qrData.company}
TEL:${qrData.phone}
EMAIL:${qrData.email}
URL:${qrData.website}
NOTE:${qrData.notes}
END:VCARD`;
  };

  const generateQRContent = () => {
    switch (selectedType) {
      case 'contact':
        return generateVCard();
      case 'website':
        return qrData.website.startsWith('http') ? qrData.website : `https://${qrData.website}`;
      case 'email':
        return `mailto:${qrData.email}`;
      case 'phone':
        return `tel:${qrData.phone}`;
      case 'text':
        return customText;
      default:
        return '';
    }
  };

  const handleGenerateQR = () => {
    const content = generateQRContent();
    if (!content.trim()) {
      Alert.alert('Error', 'Please fill in the required information');
      return;
    }
    setGeneratedQR(content);
  };

  const handleShare = async () => {
    if (!generatedQR) {
      Alert.alert('Error', 'Please generate a QR code first');
      return;
    }

    try {
      await Share.share({
        message: `Scan this QR code:\n\n${generatedQR}`,
        title: 'QR Code - Infinite Realty Hub',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleClearForm = () => {
    setQrData({
      name: user?.user_metadata?.full_name || '',
      phone: '',
      email: user?.email || '',
      company: '',
      website: '',
      notes: '',
    });
    setCustomText('');
    setGeneratedQR('');
  };

  const renderContactForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.name}
          onChangeText={(text) => setQrData({ ...qrData, name: text })}
          placeholder="John Doe"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Phone</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.phone}
          onChangeText={(text) => setQrData({ ...qrData, phone: text })}
          placeholder="(555) 123-4567"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.email}
          onChangeText={(text) => setQrData({ ...qrData, email: text })}
          placeholder="john@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Company</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.company}
          onChangeText={(text) => setQrData({ ...qrData, company: text })}
          placeholder="Infinite Realty Hub"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Website</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.website}
          onChangeText={(text) => setQrData({ ...qrData, website: text })}
          placeholder="www.example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Notes</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.notes}
          onChangeText={(text) => setQrData({ ...qrData, notes: text })}
          placeholder="Additional information..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderWebsiteForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Website URL</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.website}
          onChangeText={(text) => setQrData({ ...qrData, website: text })}
          placeholder="https://www.example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderEmailForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.email}
          onChangeText={(text) => setQrData({ ...qrData, email: text })}
          placeholder="contact@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderPhoneForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={qrData.phone}
          onChangeText={(text) => setQrData({ ...qrData, phone: text })}
          placeholder="(555) 123-4567"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderTextForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Custom Text</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
          value={customText}
          onChangeText={setCustomText}
          placeholder="Enter any text to encode in QR code..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderForm = () => {
    switch (selectedType) {
      case 'contact':
        return renderContactForm();
      case 'website':
        return renderWebsiteForm();
      case 'email':
        return renderEmailForm();
      case 'phone':
        return renderPhoneForm();
      case 'text':
        return renderTextForm();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>QR Code Generator</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create QR codes for easy sharing
          </Text>
        </View>

        {/* QR Type Selection */}
        <View style={styles.typeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>QR Code Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
            contentContainerStyle={styles.typeScrollContent}
          >
            {QR_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  { backgroundColor: selectedType === type.id ? colors.primary : colors.surface }
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text 
                  style={[
                    styles.typeName,
                    { color: selectedType === type.id ? '#ffffff' : colors.text }
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Information</Text>
          {renderForm()}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleGenerateQR}
          >
            <Text style={styles.primaryButtonText}>Generate QR Code</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtonContainer}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
              onPress={handleClearForm}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton, 
                { backgroundColor: generatedQR ? colors.success : colors.surface }
              ]}
              onPress={handleShare}
              disabled={!generatedQR}
            >
              <Text style={[
                styles.secondaryButtonText,
                { color: generatedQR ? '#ffffff' : colors.textSecondary }
              ]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Generated QR Code */}
        {generatedQR && (
          <View style={styles.qrContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Generated QR Code</Text>
            <View style={[styles.qrCodeWrapper, { backgroundColor: '#ffffff' }]}>
              <QRCode
                value={generatedQR}
                size={qrSize}
                color="#000000"
                backgroundColor="#ffffff"
                ref={qrRef}
              />
            </View>
            <Text style={[styles.qrInstruction, { color: colors.textSecondary }]}>
              Point your camera at this QR code to test it
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  typeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  typeScroll: {
    paddingLeft: 20,
  },
  typeScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  typeCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  qrCodeWrapper: {
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  qrInstruction: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});