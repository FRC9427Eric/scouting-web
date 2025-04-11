import React, { useState, useRef } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
console.log("前端正在連線到 API：", API_URL);

function App() {
  // 登入狀態與帳密
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [formData, setFormData] = useState({
    match: "",
    team_number: "",
    auto_L1: 0,
    auto_L2: 0,
    auto_L3: 0,
    auto_L4: 0,
    teleop_L1: 0,
    teleop_L2: 0,
    teleop_L3: 0,
    teleop_L4: 0,
    cage_level: "none",
    processor: 0,
    net: 0,
    fouls: 0,
    major_fouls: 0,
    notes: ""
  });

  const [message, setMessage] = useState("");
  const teamNumberRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const adjustValue = (field, delta) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, Number(prev[field]) + delta)
    }));
  };

  // 表單輸入元件（+-）
  const renderCounter = (label, name) => (
    <div className="input-group">
      <label>{label}</label>
      <div className="counter-input">
        <button type="button" onClick={() => adjustValue(name, -1)}>-1</button>
        <input
          type="number"
          name={name}
          value={formData[name]}
          onChange={handleChange}
        />
        <button type="button" onClick={() => adjustValue(name, 1)}>+1</button>
      </div>
    </div>
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("驗證中...");
    const credentials = btoa(`${username}:${password}`);
  
    try {
      const res = await fetch(`${API_URL}/submit/`, {
        method: "POST", // 用 POST 觸發驗證
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({}) // 傳空資料，後端格式正確會擋下
      });
  
      const result = await res.json();
  
      if (res.ok && result.message?.includes("successfully")) {
        setIsLoggedIn(true);
        setMessage("");
      } else {
        setMessage(`❌ 登入失敗：${result.detail || "請確認帳密"}`);
      }
    } catch (err) {
      setMessage("❌ 錯誤：" + err.message);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      match: Number(formData.match) || 0,
      team_number: Number(formData.team_number) || 0,
      auto_L1: Number(formData.auto_L1) || 0,
      auto_L2: Number(formData.auto_L2) || 0,
      auto_L3: Number(formData.auto_L3) || 0,
      auto_L4: Number(formData.auto_L4) || 0,
      teleop_L1: Number(formData.teleop_L1) || 0,
      teleop_L2: Number(formData.teleop_L2) || 0,
      teleop_L3: Number(formData.teleop_L3) || 0,
      teleop_L4: Number(formData.teleop_L4) || 0,
      cage_level: formData.cage_level || "none",
      processor: Number(formData.processor) || 0,
      net: Number(formData.net) || 0,
      fouls: Number(formData.fouls) || 0,
      major_fouls: Number(formData.major_fouls) || 0,
      notes: formData.notes || ""
    };

    try {
      const response = await fetch(`${API_URL}/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${username}:${password}`)}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok && result.message.includes("successfully")) {
        setMessage("✅ 傳送成功！");
        setFormData({
          match: "",
          team_number: "",
          auto_L1: 0,
          auto_L2: 0,
          auto_L3: 0,
          auto_L4: 0,
          teleop_L1: 0,
          teleop_L2: 0,
          teleop_L3: 0,
          teleop_L4: 0,
          cage_level: "none",
          processor: 0,
          net: 0,
          fouls: 0,
          major_fouls: 0,
          notes: ""
        });
        setTimeout(() => teamNumberRef.current?.focus(), 100);
      } else {
        setMessage(`❌ 傳送失敗：${result.detail || "未知錯誤"}`);
      }
    } catch (error) {
      setMessage("❌ 錯誤：" + error.message);
    }
  };

  return (
    <div className="App">
      <img src={`${process.env.PUBLIC_URL}/images/team-logo.jpg`} alt="Team Logo" className="full-width-image" />
      <h1>FRC Scouting</h1>

      {!isLoggedIn ? (
        <form onSubmit={handleLogin}>
          <label>使用者名稱：</label>
          <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
          <label>密碼：</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">登入</button>
          <p>{message}</p>
        </form>
      ) : (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="score-group center-row">
            <div className="input-group">
              <label>Match:</label>
              <input type="number" name="match" value={formData.match} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Team Number:</label>
              <input type="number" name="team_number" value={formData.team_number} onChange={handleChange} ref={teamNumberRef} />
            </div>
          </div>

          <div className="section">
            <h3>Auto</h3>
            <div className="score-group">
              {renderCounter("L1:", "auto_L1")}
              {renderCounter("L2:", "auto_L2")}
              {renderCounter("L3:", "auto_L3")}
              {renderCounter("L4:", "auto_L4")}
            </div>

            <h3>Teleop</h3>
            <div className="score-group">
              {renderCounter("L1:", "teleop_L1")}
              {renderCounter("L2:", "teleop_L2")}
              {renderCounter("L3:", "teleop_L3")}
              {renderCounter("L4:", "teleop_L4")}
            </div>
          </div>

          <div className="section">
            <h3>Processor/Net</h3>
            <div className="score-group">
              {renderCounter("Processor:", "processor")}
              {renderCounter("Net:", "net")}
            </div>
          </div>

          <div className="section">
            <h3>Endgame</h3>
            <div className="input-group">
              <label>Cage Level:</label>
              <div className="cage-button-group">
                {["none", "parked", "shallow", "deep"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`cage-button ${formData.cage_level === level ? "active" : ""}`}
                    onClick={() => setFormData((prev) => ({ ...prev, cage_level: level }))}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Fouls</h3>
            <div className="score-group">
              {renderCounter("Fouls:", "fouls")}
              {renderCounter("Major Fouls:", "major_fouls")}
            </div>
          </div>

          <div className="section">
            <h3>Notes</h3>
            <div className="input-group">
              <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ width: "100%", fontSize: "18px", height: "120px" }} />
            </div>
          </div>

          <button type="submit">Submit</button>
          <h3>感謝所有幫忙scout的夥伴們/Thanks to all the friends who helped scout</h3>
        </form>
      )}

      {message && (
        <div className="modal">
          <div className="modal-content">
            <p>{message}</p>
            <button onClick={() => setMessage("")}>關閉</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
