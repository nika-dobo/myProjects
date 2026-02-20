const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const challenges = [
  {
    id: "kata1",
    title: "Add Two Numbers",
    description: "Write a function `add(a, b)` that returns a + b.",
    starterCode: "function add(a, b) {\n  \n}",
    test: "add(2, 3) === 5",
  },
  {
    id: "kata2",
    title: "Multiply Numbers",
    description: "Write a function `multiply(a, b)` that returns a * b.",
    starterCode: "function multiply(a, b) {\n  \n}",
    test: "multiply(4, 5) === 20",
  },
  {
    id: "kata3",
    title: "Is Even",
    description: "Write a function `isEven(n)` that returns true if even.",
    starterCode: "function isEven(n) {\n  \n}",
    test: "isEven(6) === true",
  },
  {
    id: "kata4",
    title: "Reverse String",
    description: "Write `reverse(str)` that returns the reversed string.",
    starterCode: "function reverse(str) {\n  \n}",
    test: 'reverse("abc") === "cba"',
  },
];

app.get("/api/challenges", (req, res) => {
  res.json(challenges);
});

app.get("/api/challenges/:id", (req, res) => {
  const challenge = challenges.find((c) => c.id === req.params.id);
  if (!challenge) return res.status(404).json({ error: "Not found" });
  res.json(challenge);
});

app.post("/api/submit", (req, res) => {
  const { code, challengeId } = req.body;
  const challenge = challenges.find((c) => c.id === challengeId);
  if (!code || !challenge)
    return res.status(400).json({ passed: false, error: "Invalid data" });

  const tempPath = path.join(__dirname, "temp.js");
  const testCode = `${code}\n\ntry { console.log(${challenge.test}); } catch (e) { console.error(e.message); process.exit(1); }`;

  try {
    fs.writeFileSync(tempPath, testCode);
    const output = execSync(`node ${tempPath}`, { timeout: 3000 })
      .toString()
      .trim();
    fs.unlinkSync(tempPath);
    res.json({ passed: output === "true", output });
  } catch (e) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.json({ passed: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
