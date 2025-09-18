import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '@/firebase';
import { router } from 'expo-router';

export default function SignInScreen() {
    const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
    const [phone, setPhone] = useState('');
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const checkPhoneExists = async (phoneNumber: string): Promise<boolean> => {
        try {
            // Check if phone exists in Firestore users collection
            const usersRef = doc(db, 'phoneNumbers', phoneNumber);
            const userDoc = await getDoc(usersRef);
            return userDoc.exists();
        } catch (error) {
            console.error('Error checking phone:', error);
            return false;
        }
    };

    const sendCode = async () => {
        try {
            if (!/^\+\d{7,15}$/.test(phone)) {
                Alert.alert('Invalid phone', 'Use international format, e.g. +15551234567');
                return;
            }

            setLoading(true);

            // Check if phone number exists in database
            const phoneExists = await checkPhoneExists(phone);
            if (!phoneExists) {
                Alert.alert('Phone number does not exist', 'This phone number is not registered. Please sign up first.');
                setLoading(false);
                return;
            }

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
                    <Text style={styles.subtitle}>Sign in with your phone number</Text>

                    {!verificationId ? (
                        <>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Phone (+15551234567)" 
                                keyboardType="phone-pad" 
                                value={phone} 
                                onChangeText={setPhone}
                                autoFocus
                            />
                            <TouchableOpacity 
                                style={[styles.button, loading && styles.buttonDisabled]} 
                                onPress={sendCode} 
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Checking...' : 'Send OTP'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.subtitle}>Enter the OTP sent to {phone}</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="123456" 
                                keyboardType="number-pad" 
                                value={code} 
                                onChangeText={setCode}
                                autoFocus
                                maxLength={6}
                            />
                            <TouchableOpacity 
                                style={[styles.button, loading && styles.buttonDisabled]} 
                                onPress={confirmCode} 
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.link} 
                                onPress={() => setVerificationId(null)}
                            >
                                <Text style={styles.linkText}>Change phone number</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity 
                        style={styles.link} 
                        onPress={() => router.replace('/sign-up' as any)}
                    >
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
    title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center', color: '#111827' },
    subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
    input: { 
        backgroundColor: '#fff', 
        borderWidth: 1, 
        borderColor: '#e5e7eb', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 16,
        fontSize: 16
    },
    button: { 
        backgroundColor: '#2563eb', 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center',
        marginBottom: 12
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    link: { marginTop: 8, alignItems: 'center' },
    linkText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
});