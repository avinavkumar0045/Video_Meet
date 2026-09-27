import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { Snackbar } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../styles/auth.module.css';
import { useNavigate } from 'react-router-dom';

export default function Authentication() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // 0 = login, 1 = register
    const [formState, setFormState] = useState(0);
    const [open, setOpen] = useState(false);

    const { handleRegister, handleLogin } = useContext(AuthContext);
    const router = useNavigate();

    const handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        } catch (err) {
            console.log("Auth error:", err);
            let errMsg;
            if (err.response && err.response.data && err.response.data.message) {
                errMsg = err.response.data.message;
            } else if (err.message) {
                errMsg = err.message;
            } else {
                errMsg = "Something went wrong. Please try again.";
            }
            setError(errMsg);
        }
    };

    return (
        <div className={styles.container}>
            {/* Ambient Background */}
            <div className={styles.heroBackground}>
                <div className={styles.glowBlue}></div>
                <div className={styles.glowPurple}></div>
            </div>

            <div className={`glass-card ${styles.authCard}`}>
                <div className={styles.header}>
                    <div className={styles.logo} onClick={() => router("/")} style={{cursor: "pointer"}}>
                        <span style={{ color: '#FF9933' }}>Mann </span>
                        <span style={{ color: '#FFFFFF' }}>Ki </span>
                        <span style={{ color: '#138808' }}>Baat</span>
                    </div>
                    <p className={styles.subtitle}>
                        {formState === 0 ? "Sign in to continue to your meetings" : "Create an account to get started"}
                    </p>
                </div>

                <div className={styles.form}>
                    {formState === 1 && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input 
                                type="text" 
                                className={styles.input} 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Username</label>
                        <input 
                            type="text" 
                            className={styles.input} 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="johndoe"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <div className={styles.passwordWrapper}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className={styles.input} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                className={styles.eyeButton}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button className={`btn-primary ${styles.submitBtn}`} onClick={handleAuth}>
                        {formState === 0 ? "Sign In" : "Register"}
                    </button>

                    <div className={styles.toggleAuth}>
                        {formState === 0 ? (
                            <p>Don't have an account? <button className={styles.link} onClick={() => setFormState(1)}>Sign up</button></p>
                        ) : (
                            <p>Already have an account? <button className={styles.link} onClick={() => setFormState(0)}>Sign in</button></p>
                        )}
                    </div>
                </div>
            </div>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                onClose={() => setOpen(false)}
            />
        </div>
    );
}