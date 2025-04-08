
import React, { useState, useRef } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
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
    if (e.key === "Enter") {
      e.preventDefault();
    }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok && result.message === "Data successfully written to Google Sheets!") {
        setMessage("傳送成功！");
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
        setMessage(`傳送失敗：${result.detail || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setMessage(`錯誤：${error.message}`);
    }
  };

  const renderCounter = (label, name) => (
    <div className="input-group">
      <label>{label}</label>
      <div className="counter-input">
        <button type="button" onClick={() => adjustValue(name, 1)}>+1</button>
        <input
          type="number"
          name={name}
          value={formData[name]}
          onChange={handleChange}
        />
        <button type="button" onClick={() => adjustValue(name, -1)}>-1</button>
      </div>
    </div>
  );

  return (
    <div className="App">
      <img src={\`\${process.env.PUBLIC_URL}/images/team-logo.jpg\`} alt="Team Logo" className="full-width-image" />
      <h1>FRC Scouting</h1>

      <div className="score-group">
        <div className="input-group">
          <label>Match:</label>
          <input type="number" name="match" value={formData.match} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Team Number:</label>
          <input type="number" name="team_number" value={formData.team_number} onChange={handleChange} ref={teamNumberRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="section">
          <img src={\`\${process.env.PUBLIC_URL}/images/coral.jpg\`} alt="Coral" className="scaled-image" />
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
          <img src={\`\${process.env.PUBLIC_URL}/images/algae.jpg\`} alt="Algae" className="scaled-image" />
          <h3>Processor</h3>
          <div className="score-group">
            {renderCounter("Processor:", "processor")}
            {renderCounter("Net:", "net")}
          </div>
        </div>

        <div className="section">
          <h3>Endgame</h3>
          <div className="score-group">
            <div className="input-group cage-level-inline">
              <label htmlFor="cage_level">Cage Level:</label>
              <select id="cage_level" name="cage_level" value={formData.cage_level} onChange={handleChange}>
                <option value="none">none</option>
                <option value="parked">parked</option>
                <option value="deep">deep</option>
                <option value="shallow">shallow</option>
              </select>
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
      </form>

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
