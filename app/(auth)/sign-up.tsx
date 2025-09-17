import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential, updateEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '@/firebase';
import { router } from 'expo-router';

export default function SignUpScreen() {
    const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [code, setCode] = useState('');
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

    const confirmAndSave = async () => {
        try {
            if (!verificationId) return;
            if (!name || !email || !address) {
                Alert.alert('Missing info', 'Please fill name, email and address.');
                return;
            }
            setLoading(true);
            const credential = PhoneAuthProvider.credential(verificationId, code);
            const result = await signInWithCredential(auth, credential);
            // attempt to set email on user profile (may require recent login on some providers)
            try { await updateEmail(result.user, email); } catch { }
            // Save profile to Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                name,
                email,
                phone,
                address,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });
            router.replace('/');
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Invalid code or failed to create account');
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
                    <Text style={styles.title}>Create account</Text>
                    {!verificationId ? (
                        <>
                            <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
                            <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
                            <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
                            <TextInput style={styles.input} placeholder="Phone (+15551234567)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={sendCode} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.link} onPress={() => router.replace('/sign-in' as any)}>
                                <Text style={styles.linkText}>Already have an account? Sign in</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.subtitle}>Enter the OTP sent to {phone}</Text>
                            <TextInput style={styles.input} placeholder="123456" keyboardType="number-pad" value={code} onChangeText={setCode} />
                            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={confirmAndSave} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Create Account'}</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
});
