import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, firebaseConfig } from '@/firebase';
import { router } from 'expo-router';

export default function SignInScreen() {
    const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
    const [mode, setMode] = useState<'phone' | 'email'>('phone');
    const [phone, setPhone] = useState('');
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const sendCode = async () => {
        try {
            if (!/^\+\d{7,15}$/.test(phone)) {
                Alert.alert('Invalid phone', 'Use international format, e.g. +15551234567');
                return;
            }
            setLoading(true);
            const provider = new PhoneAuthProvider(auth);
            const id = await provider.verifyPhoneNumber(phone, recaptchaVerifier.current!);
            setVerificationId(id);
            Alert.alert('Code sent', 'Check your SMS for the verification code.');
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const confirmCode = async () => {
        try {
            if (!verificationId) return;
            setLoading(true);
            const credential = PhoneAuthProvider.credential(verificationId, code);
            await signInWithCredential(auth, credential);
            router.replace('/');
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const signInEmail = async () => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email.trim(), password);
            router.replace('/');
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async () => {
        try {
            if (!email) {
                Alert.alert('Email required', 'Enter your email to reset password.');
                return;
            }
            await sendPasswordResetEmail(auth, email.trim());
            Alert.alert('Email sent', 'Check your inbox for reset instructions.');
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to send reset email');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={firebaseConfig as any}
                attemptInvisibleVerification
            />
            <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Welcome back</Text>

                    <View style={styles.switchRow}>
                        <TouchableOpacity onPress={() => setMode('phone')} style={[styles.switchBtn, mode === 'phone' && styles.switchActive]}>
                            <Text style={[styles.switchText, mode === 'phone' && styles.switchTextActive]}>Phone</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setMode('email')} style={[styles.switchBtn, mode === 'email' && styles.switchActive]}>
                            <Text style={[styles.switchText, mode === 'email' && styles.switchTextActive]}>Email</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === 'phone' ? (
                        !verificationId ? (
                            <>
                                <TextInput style={styles.input} placeholder="Phone (+15551234567)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={sendCode} disabled={loading}>
                                    <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.subtitle}>Enter the OTP sent to {phone}</Text>
                                <TextInput style={styles.input} placeholder="123456" keyboardType="number-pad" value={code} onChangeText={setCode} />
                                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={confirmCode} disabled={loading}>
                                    <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Sign In'}</Text>
                                </TouchableOpacity>
                            </>
                        )
                    ) : (
                        <>
                            <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
                            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
                            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={signInEmail} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.link} onPress={forgotPassword}>
                                <Text style={styles.linkText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity style={styles.link} onPress={() => router.replace('/sign-up' as any)}>
                        <Text style={styles.linkText}>New here? Create account</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 16, flexGrow: 1, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center', color: '#111827' },
    subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 10 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12 },
    button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#fff', fontWeight: '700' },
    link: { marginTop: 12, alignItems: 'center' },
    linkText: { color: '#2563eb', fontWeight: '600' },
    switchRow: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#e5e7eb', borderRadius: 10 },
    switchBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
    switchActive: { backgroundColor: '#fff', borderRadius: 10 },
    switchText: { color: '#374151', fontWeight: '600' },
    switchTextActive: { color: '#111827' },
});
