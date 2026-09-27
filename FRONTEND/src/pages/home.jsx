import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import withAuth from '../utils/withAuth';
import styles from '../styles/home.module.css';
import { Video, Hash, Bell, LogOut, History } from 'lucide-react';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState(""); 
    const [showJoinInput, setShowJoinInput] = useState(false);
    
    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    const handleCreateVideoCall = async () => {
        const newCode = Math.random().toString(36).substring(2, 7);
        await addToUserHistory(newCode);
        navigate(`/${newCode}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <div className={styles.logo} onClick={() => navigate("/")} style={{cursor: "pointer"}}>
                    <span style={{ color: '#FF9933' }}>Mann </span>
                    <span style={{ color: '#FFFFFF' }}>Ki </span>
                    <span style={{ color: '#138808' }}>Baat</span>
                </div>

                <div className={styles.navActions}>
                    <button className={styles.iconBtn} onClick={() => navigate("/history")} title="History">
                        <History size={22} />
                    </button>
                    <button className={styles.iconBtn} title="Notifications">
                        <Bell size={22} />
                    </button>
                    <button className={styles.iconBtn} onClick={handleLogout} title="Logout">
                        <LogOut size={22} />
                    </button>
                    <button className={styles.avatar} onClick={() => navigate("/profile")}>
                        U
                    </button>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.greeting}>
                    <p>Good evening,</p>
                    <h1>Welcome Back 👋</h1>
                    <p className={styles.subtitle}>Ready to connect? Start a meeting or join with a code.</p>
                </div>

                <div className={styles.actionCards}>
                    <div className={`${styles.card} ${styles.startCard}`} onClick={handleCreateVideoCall}>
                        <div className={styles.startIcon}>
                            <Video size={24} />
                        </div>
                        <div>
                            <h3 className={styles.cardTitle}>Start a Meeting</h3>
                            <p className={styles.cardDesc}>Create a new meeting instantly</p>
                        </div>
                    </div>

                    <div className={`${styles.card} ${styles.joinCard}`} onClick={() => setShowJoinInput(true)}>
                        <div className={styles.joinIcon}>
                            <Hash size={24} />
                        </div>
                        <div>
                            <h3 className={styles.cardTitle}>Join with Code</h3>
                            <p className={styles.cardDesc}>Enter a meeting code to join</p>
                        </div>
                        
                        {showJoinInput && (
                            <div className={styles.joinInputGroup} onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="text" 
                                    className={styles.joinInput} 
                                    placeholder="e.g. 7f3k9"
                                    value={meetingCode}
                                    onChange={(e) => setMeetingCode(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoinVideoCall()}
                                    autoFocus
                                />
                                <button className={styles.joinBtn} onClick={handleJoinVideoCall}>
                                    Join
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuth(HomeComponent);
