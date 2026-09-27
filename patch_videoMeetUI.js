const fs = require('fs');

let code = fs.readFileSync('FRONTEND/src/pages/videoMeet.jsx', 'utf8');

// 1. Fix Lobby Form
const oldLobbyForm = `<div className={styles.lobbyForm}>
                        <h2>Enter into Lobby</h2>
                        <TextField 
                            id="outlined-basic" 
                            label="Username" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            variant="outlined" 
                            sx={{ 
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                                    "&:hover fieldset": { borderColor: "white" },
                                },
                                "& .MuiInputBase-input": { color: "white" },
                                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" }
                            }}
                        />
                        <Button variant="contained" size="large" onClick={connect}>Connect</Button>
                    </div>`;

const newLobbyForm = `<div className={styles.lobbyForm}>
                        <h2>Join Lobby</h2>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{
                                width: "100%",
                                height: "52px",
                                background: "var(--surface-primary)",
                                border: "1px solid var(--border-primary)",
                                borderRadius: "var(--radius-md)",
                                padding: "0 16px",
                                color: "var(--text-primary)",
                                fontSize: "15px",
                                outline: "none"
                            }}
                            onFocus={(e) => { e.target.style.borderColor = "var(--brand-blue)" }}
                            onBlur={(e) => { e.target.style.borderColor = "var(--border-primary)" }}
                        />
                        <button className="btn-primary" onClick={connect} style={{width: "100%"}}>
                            Connect
                        </button>
                    </div>`;

code = code.replace(oldLobbyForm, newLobbyForm);


// 2. Fix Chat Messages
const oldChatMessages = `{ messages.length > 0 ? messages.map((item ,index)=>{
                                return (
                                    <div style={{marginBottom: "20px"}} key={index}>
                                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                        <p>{item.data}</p>

                                    </div>
                                )
                            }) : <p>No messages yet </p>}`;

const newChatMessages = `{ messages.length > 0 ? messages.map((item ,index)=>{
                                const isOwn = item.sender === username;
                                return (
                                    <div className={\`\${styles.chatMessage} \${isOwn ? styles.ownMessage : ''}\`} key={index}>
                                        <p className={styles.sender}>{item.sender}</p>
                                        <p className={styles.text}>{item.data}</p>
                                    </div>
                                )
                            }) : <p style={{color: "var(--text-muted)", fontSize: "14px"}}>No messages yet</p>}`;
                            
code = code.replace(oldChatMessages, newChatMessages);

// 3. Fix Chat Input Area
const oldChatInput = `<div className={styles.chattingArea}>
                          {/* {message} */}
                          <TextField value={message} onChange={(e)=> setMessage(e.target.value)} id="outlined-basic" label="Enter your chat" variant="outlined" 
                          sx={{ 
                              flexGrow: 1, 
                              "& .MuiOutlinedInput-root": {
                                  "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                                  "&:hover fieldset": { borderColor: "white" },
                              },
                              "& .MuiInputBase-input": { color: "white" },
                              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" }
                          }} 
                          />
                          <Button variant='contained' onClick={sendMessage}>Send</Button>
                        </div>`;

const newChatInput = `<div className={styles.chattingArea}>
                          <input 
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Type a message..."
                              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                              style={{
                                  flexGrow: 1,
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--text-primary)",
                                  fontSize: "14px",
                                  outline: "none"
                              }}
                          />
                          <button 
                              onClick={sendMessage}
                              style={{
                                  background: "var(--brand-purple)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "var(--radius-sm)",
                                  padding: "6px 12px",
                                  fontWeight: "600",
                                  cursor: "pointer"
                              }}
                          >Send</button>
                        </div>`;
                        
code = code.replace(oldChatInput, newChatInput);

fs.writeFileSync('FRONTEND/src/pages/videoMeet.jsx', code);
