import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { Entypo } from '@expo/vector-icons';

type LetterRow = {
  letters: string;
  size: number;
  ratio: string;
  weight: number;
};

type RowResult = {
  attempted: boolean;
  correct: boolean;
  userAnswer: string;
};

const letterRows: LetterRow[] = [
  { letters: "PTOC", size: 60, ratio: "20/63", weight: 1 },
  { letters: "ZLPED", size: 48, ratio: "20/50", weight: 2 },
  { letters: "ETODCF", size: 36, ratio: "20/40", weight: 2 },
  { letters: "DPCZLFT", size: 30, ratio: "20/32", weight: 3 },
  { letters: "LDCZOTEP", size: 20, ratio: "20/20", weight: 4 },
  { letters: "FPCDTZLE", size: 18, ratio: "20/16", weight: 4 },
  { letters: "OLEFDTZP", size: 16, ratio: "20/12.5", weight: 4 },
];

export default function VisionTest() {
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [rowResults, setRowResults] = useState<RowResult[]>(
    letterRows.map(() => ({
      attempted: false,
      correct: false,
      userAnswer: "",
    }))
  );

  const handleSubmitRow = () => {
    const newResults = [...rowResults];
    newResults[currentRowIndex] = {
      attempted: true,
      correct: userInput.toUpperCase() === letterRows[currentRowIndex].letters,
      userAnswer: userInput.toUpperCase(),
    };
    setRowResults(newResults);
    setUserInput("");
    if (currentRowIndex < letterRows.length - 1) {
      setCurrentRowIndex(currentRowIndex + 1);
    }
  };

  const getVisualAcuity = () => {
    for (let i = letterRows.length - 1; i >= 0; i--) {
      if (rowResults[i].correct) {
        return letterRows[i].ratio;
      }
    }
    return letterRows[0].ratio;
  };

  const calculateOverallScore = () => {
    let score = 0;
    let totalWeight = 0;
    rowResults.forEach((result, index) => {
      if (result.correct) {
        score += letterRows[index].weight;
      }
      totalWeight += letterRows[index].weight;
    });
    return Math.round((score / totalWeight) * 20);
  };

  const isTestComplete = rowResults.every(
    (row, index) => row.attempted || index > currentRowIndex
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Vision Test</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.grid}>
            {/* Snellen Chart Section */}
            <View style={styles.chart}>
              {letterRows.map((row, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.ratio}>{row.ratio}</Text>
                  <Text style={[styles.letters, { fontSize: row.size }]}>
                    {row.letters}
                  </Text>
                  <View style={styles.resultIcon}>
                    {rowResults[index].attempted &&
                      (rowResults[index].correct ? (
                        <Entypo name="check" size={16} color="green" />
                      ) : (
                        <Entypo name="circle-with-cross" size={16} color="red" />
                      ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Input/Results Section */}
            <View style={styles.inputSection}>
              {!isTestComplete ? (
                <View>
                  <Text style={styles.label}>
                    Enter the letters for row {currentRowIndex + 1} ({letterRows[currentRowIndex].ratio}):
                  </Text>
                  <TextInput
                    value={userInput}
                    onChangeText={(text) => setUserInput(text.toUpperCase())}
                    maxLength={letterRows[currentRowIndex].letters.length}
                    style={styles.input}
                    placeholder={`Enter ${letterRows[currentRowIndex].letters.length} letters`}
                    autoFocus
                    autoCapitalize="characters"
                  />
                  <Pressable
                    style={[
                      styles.button,
                      userInput.length !== letterRows[currentRowIndex].letters.length && styles.buttonDisabled
                    ]}
                    onPress={handleSubmitRow}
                    disabled={userInput.length !== letterRows[currentRowIndex].letters.length}
                  >
                    <Text style={styles.buttonText}>Submit Row</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.results}>
                  <Text style={styles.resultTitle}>Test Complete</Text>
                  {rowResults.map((result, index) => (
                    <View key={index} style={styles.resultRow}>
                      <Text>Row {index + 1} ({letterRows[index].ratio}):</Text>
                      <Text style={{ color: result.correct ? 'green' : 'red' }}>
                        {result.userAnswer || "Skipped"}
                      </Text>
                    </View>
                  ))}
                  <Text style={styles.score}>Visual Acuity: {getVisualAcuity()}</Text>
                  <Text style={styles.score}>Overall Score: {calculateOverallScore()} / 20</Text>
                  <Pressable
                    style={styles.button}
                    onPress={() => {
                      setCurrentRowIndex(0);
                      setUserInput("");
                      setRowResults(
                        letterRows.map(() => ({
                          attempted: false,
                          correct: false,
                          userAnswer: "",
                        }))
                      );
                    }}
                  >
                    <Text style={styles.buttonText}>Start New Test</Text>
                  </Pressable>
                </View>
              )}

              {/* Stats Section */}
              <View style={styles.stats}>
                <Text style={styles.statText}>
                  Current Row: {currentRowIndex + 1} of {letterRows.length}
                </Text>
                <Text style={styles.statText}>
                  Correct Rows: {rowResults.filter((r) => r.correct).length} /{" "}
                  {rowResults.filter((r) => r.attempted).length}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    gap: 24,
  },
  grid: {
    gap: 32,
  },
  chart: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 4,
  },
  ratio: {
    width: 48,
    fontSize: 12,
    color: '#666',
  },
  letters: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  resultIcon: {
    width: 48,
    alignItems: 'center',
  },
  inputSection: {
    gap: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    gap: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  score: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  stats: {
    gap: 4,
    marginTop: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});