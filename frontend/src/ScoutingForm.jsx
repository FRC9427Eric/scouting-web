import React, { useState } from "react";

export default function ScoutingForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); // 使用者帳號
  const [password, setPassword] = useState(""); // 使用者密碼
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    match: 1,
    team_number: 0,
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
    notes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("驗證中...");

    const credentials = btoa(`${username}:${password}`);

    try {
      // 嘗試用 GET 調用 /submit/ 來驗證帳密
      const res = await fetch("http://localhost:8000/submit/", {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (res.ok) {
        setIsLoggedIn(true);
        setMessage("✅ 登入成功，請填寫表單");
      } else {
        const data = await res.json();
        setMessage(`❌ 登入失敗：${data.detail}`);
      }
    } catch (err) {
      setMessage("❌ 錯誤：" + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("提交中...");

    const credentials = btoa(`${username}:${password}`);

    try {
      const res = await fetch("http://localhost:8000/submit/", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ 成功寫入 Google Sheets！");
      } else {
        setMessage(`❌ 提交錯誤：${result.detail}`);
      }
    } catch (err) {
      setMessage("❌ 發生錯誤：" + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>FRC Scouting 登入系統</h2>

      {!isLoggedIn ? (
        <form onSubmit={handleLogin}>
          <label>使用者名稱：</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>密碼：</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">登入</button>
          <p>{message}</p>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Match 編號：</label>
          <input
            type="number"
            name="match"
            value={form.match}
            onChange={handleChange}
          />

          <label>Team Number：</label>
          <input
            type="number"
            name="team_number"
            value={form.team_number}
            onChange={handleChange}
          />

          {/* 更多欄位可自由加入 */}
          <label>備註：</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} />

          <button type="submit">送出表單</button>
          <p>{message}</p>
        </form>
      )}
    </div>
  );
}
