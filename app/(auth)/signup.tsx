import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, ArrowLeft } from 'lucide-react-native';
import { apiService } from '@/services/api';

// Email & phone regex patterns
const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^\d{7,15}$/;

// Password strength checker
function getPasswordStrength(password: string) {
  if (password.length < 6) return 'Weak';
  if (/[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8) return 'Strong';
  return 'Medium';
}

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' })); // Clear error on change
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword } = formData;
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Enter your full name';
    if (!emailRegex.test(email)) newErrors.email = 'Enter a valid email';
    if (!phoneRegex.test(phone)) newErrors.phone = 'Enter a valid phone number';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 chars';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords don’t match';
    if (!acceptTerms) newErrors.terms = 'You must accept the terms';

    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      Alert.alert('Validation Error', Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { token, user } = await apiService.register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );
      apiService.setAuthToken(token);

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Error', error?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessible accessibilityLabel="Back">
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.logo}><User size={28} color="#fff" /></View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join SplitWise and manage your expenses</Text>
            </View>
          </View>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <User size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  value={formData.name}
                  onChangeText={val => updateFormData('name', val)}
                  accessibilityLabel="Full name input"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={val => updateFormData('email', val)}
                  accessibilityLabel="Email input"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Phone size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={val => updateFormData('phone', val)}
                  accessibilityLabel="Phone number input"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={val => updateFormData('password', val)}
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                </TouchableOpacity>
              </View>
              {!!formData.password && (
                <Text style={styles.passwordStrength}>
                  Strength: {getPasswordStrength(formData.password)}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={val => updateFormData('confirmPassword', val)}
                  accessibilityLabel="Confirm password input"
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => {
                setAcceptTerms(!acceptTerms);
                setErrors(prev => ({ ...prev, terms: '' }));
              }}
              accessible
              accessibilityLabel="Accept terms"
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, (loading || Object.keys(errors).length > 0) && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              accessible
              accessibilityLabel="Create account"
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.signupButtonText}>Create Account</Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
                Sign In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { paddingTop: 20, paddingBottom: 32 },
  backButton: { padding: 8, marginBottom: 20 },
  headerContent: { alignItems: 'center' },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24 },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827', paddingVertical: 12 },
  eyeIcon: { padding: 4 },
  passwordStrength: { fontSize: 12, color: '#374151', marginTop: 4 },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  termsText: { flex: 1, fontSize: 14, color: '#6b7280', lineHeight: 20 },
  termsLink: { color: '#2563eb', fontWeight: '600' },
  signupButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  signupButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginRight: 8 },
  footer: { paddingVertical: 24, alignItems: 'center' },
  footerText: { fontSize: 16, color: '#6b7280' },
  loginLink: { color: '#2563eb', fontWeight: '600' },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 4 },
});
