import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FantasyCalculator() {
  const [stats, setStats] = useState({
    name: "",
    points: "",
    rebounds: "",
    assists: "",
    blocks: "",
    steals: "",
    turnovers: "",
    fouls: "",
    fgMade: "",
    fgAttempted: "",
    ftMade: "",
    ftAttempted: "",
    threePM: "",
  });
  const [fantasyPoints, setFantasyPoints] = useState(null);
  const [error, setError] = useState("");
  const [savedCalculations, setSavedCalculations] = useState({});
  const [scoring, setScoring] = useState({
    points: 1,
    rebounds: 1.2,
    assists: 1.5,
    blocks: 3,
    steals: 3,
    turnovers: -1,
    fouls: -0.5,
    fgMade: 1,
    fgMissed: -0.5,
    ftMade: 0.5,
    ftMissed: -0.5,
    threePM: 1,
  });

  const getScoringHash = () => {
    return JSON.stringify(scoring)
  };

  const calculateFantasyPoints = () => {
    const statsValues = Object.fromEntries(
      Object.entries(stats).map(([key, value]) => [key, key === "name" ? value : parseFloat(value) || 0])
    );

    if (2 * statsValues.fgMade + statsValues.ftMade + statsValues.threePM !== statsValues.points) {
      setError("Invalid input: The total points scored do not match the shots made. Ensure that (2 × FG Made) + FT Made + 3PM = Points.");
      setFantasyPoints(null);
      return;
    }

    if (statsValues.fgAttempted < statsValues.fgMade || statsValues.fgAttempted < statsValues.threePM || statsValues.ftAttempted < statsValues.ftMade) {
      setError("Invalid input: The number of shots attempted must be greater than or equal to the number of shots made.");
      setFantasyPoints(null);
      return;
    }

    setError("");
    const totalFantasyPoints =
      statsValues.points * scoring.points +
      statsValues.rebounds * scoring.rebounds +
      statsValues.assists * scoring.assists +
      statsValues.blocks * scoring.blocks +
      statsValues.steals * scoring.steals +
      statsValues.turnovers * scoring.turnovers +
      statsValues.fouls * scoring.fouls +
      statsValues.fgMade * scoring.fgMade +
      (statsValues.fgAttempted - statsValues.fgMade) * scoring.fgMissed +
      statsValues.ftMade * scoring.ftMade +
      (statsValues.ftAttempted - statsValues.ftMade) * scoring.ftMissed +
      statsValues.threePM * scoring.threePM;

    setFantasyPoints(totalFantasyPoints.toFixed(2));
  };

  const saveCalculation = () => {
    if (!stats.name) {
      setError("Error: Player name is required.");
      return;
    }
    if (fantasyPoints !== null) {
      const scoringHash = getScoringHash();
      setSavedCalculations((prev) => ({
        ...prev,
        [`${stats.name}-${scoringHash}`]: { name: stats.name, points: fantasyPoints, scoringHash },
      }));
    }
  };

  return (
    <div className="flex">
      <Card className="w-1/4 p-4 shadow-lg rounded-2xl bg-gray-100">
        <CardContent>
          <h3 className="text-lg font-bold mb-2">Scoring Settings</h3>
          {Object.keys(scoring).map((key) => (
            <div key={key} className="flex flex-col mb-2">
              <label className="text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
              <Input
                type="number"
                value={scoring[key]}
                onChange={(e) =>
                  setScoring((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))
                }
                className="p-2 border rounded shadow-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="w-3/4 mx-auto p-4 shadow-lg rounded-2xl bg-white">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Fantasy Basketball Calculator</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(stats).map((key) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                <Input
                  type={key === "name" ? "text" : "number"}
                  placeholder={key === "name" ? "Enter player name" : "0"}
                  value={stats[key]}
                  onChange={(e) =>
                    setStats((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="p-2 border rounded shadow-sm"
                />
              </div>
            ))}
          </div>
          <Button onClick={calculateFantasyPoints} className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg">
            Calculate Fantasy Points
          </Button>
          {fantasyPoints !== null && (
            <>
              <Button onClick={saveCalculation} className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg">
                Save Calculation
              </Button>
              <div className="mt-4 text-center text-black-600 font-bold">{stats.name ? stats.name + "\'s fantasy points: " : ""}{fantasyPoints}</div>
            </>
          )}
          {error && <div className="mt-4 text-center text-red-600 font-bold">{error}</div>}
          {savedCalculations && Object.keys(savedCalculations).length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Saved Calculations:</h3>
              <ul className="list-disc list-inside">
                {Object.values(savedCalculations).map((entry, index) => (
                  <li key={index}>
                    {entry.name}: {entry.points} FP {entry.scoringHash !== getScoringHash() ? "(Old Config)" : "(Current Config)"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
