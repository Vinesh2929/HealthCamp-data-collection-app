// import React, { useState } from "react";
// const AutorefractorTest = () => {
//   const [currentEye, setCurrentEye] = useState("right");

//   return (
//     <div className="w-full max-w-4xl mx-auto bg-gray-50 p-6">
//       <div className="bg-white rounded-lg shadow-md p-6">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-center text-gray-800">
//             Autorefractor Test - Station 3
//           </h1>
//         </div>
//         {/* Eye Selector */}
//         <div className="flex gap-4 mb-6">
//           <button
//             className={`flex-1 py-3 rounded-lg border-2 ${
//               currentEye === "right"
//                 ? "bg-blue-500 text-white border-blue-500"
//                 : "border-blue-500 text-blue-500"
//             }`}
//             onClick={() => setCurrentEye("right")}
//           >
//             Right Eye
//           </button>
//           <button
//             className={`flex-1 py-3 rounded-lg border-2 ${
//               currentEye === "left"
//                 ? "bg-blue-500 text-white border-blue-500"
//                 : "border-blue-500 text-blue-500"
//             }`}
//             onClick={() => setCurrentEye("left")}
//           >
//             Left Eye
//           </button>
//         </div>
//         {/* Input Fields */}
//         <div className="space-y-4">
//           {/* First Row */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm text-gray-600 mb-2">Sphere</label>
//               <input
//                 type="text"
//                 placeholder="±0.00"
//                 className="w-full p-3 border rounded-lg"
//               />
//             </div>
//             <div>
//               <label className="block text-sm text-gray-600 mb-2">
//                 Cylinder
//               </label>
//               <input
//                 type="text"
//                 placeholder="±0.00"
//                 className="w-full p-3 border rounded-lg"
//               />
//             </div>
//           </div>
//           {/* Second Row */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm text-gray-600 mb-2">Axis</label>
//               <input
//                 type="text"
//                 placeholder="0-180"
//                 className="w-full p-3 border rounded-lg"
//               />
//             </div>
//             <div>
//               <label className="block text-sm text-gray-600 mb-2">PD</label>
//               <input
//                 type="text"
//                 placeholder="00.0"
//                 className="w-full p-3 border rounded-lg"
//               />
//             </div>
//           </div>
//           {/* Notes */}
//           <div className="mt-4">
//             <label className="block text-sm text-gray-600 mb-2">Notes</label>
//             <textarea
//               placeholder="Add any additional observations..."
//               className="w-full p-3 border rounded-lg h-24"
//             />
//           </div>
//           {/* Staff ID */}
//           <div className="mt-4">
//             <label className="block text-sm text-gray-600 mb-2">Staff ID</label>
//             <input
//               type="text"
//               placeholder="Enter your staff ID"
//               className="w-full p-3 border rounded-lg"
//             />
//           </div>
//           {/* Buttons */}
//           <div className="flex gap-4 mt-6">
//             <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold">
//               Save Test Results
//             </button>
//             <button className="flex-1 border-2 border-blue-500 text-blue-500 py-3 rounded-lg font-semibold">
//               Reset
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// const VisionTest = () => {
//   const letterRows = [
//     { letters: "PTOC", size: "text-5xl", ratio: "20/63", weight: 1 },
//     { letters: "ZLPED", size: "text-4xl", ratio: "20/50", weight: 2 },
//     { letters: "ETODCF", size: "text-3xl", ratio: "20/40", weight: 2 },
//     { letters: "DPCZLFT", size: "text-2xl", ratio: "20/32", weight: 3 },
//     { letters: "LDCZOTEP", size: "text-xl", ratio: "20/20", weight: 4 },
//   ];
//   const [currentRowIndex, setCurrentRowIndex] = useState(0);
//   const [userInput, setUserInput] = useState("");
//   const [savedTests, setSavedTests] = useState([]);
//   const [staffId, setStaffId] = useState("");
//   const [rowResults, setRowResults] = useState(
//     letterRows.map(() => ({
//       attempted: false,
//       correct: false,
//       userAnswer: "",
//     }))
//   );
//   const handleSubmitRow = () => {
//     const newResults = [...rowResults];
//     newResults[currentRowIndex] = {
//       attempted: true,
//       correct: userInput.toUpperCase() === letterRows[currentRowIndex].letters,
//       userAnswer: userInput.toUpperCase(),
//     };
//     setRowResults(newResults);
//     setUserInput("");
//     if (currentRowIndex < letterRows.length - 1) {
//       setCurrentRowIndex(currentRowIndex + 1);
//     }
//   };
//   const getVisualAcuity = () => {
//     for (let i = letterRows.length - 1; i >= 0; i--) {
//       if (rowResults[i].correct) {
//         return letterRows[i].ratio;
//       }
//     }
//     return letterRows[0].ratio;
//   };
//   const calculateOverallScore = () => {
//     let score = 0;
//     let totalWeight = 0;
//     rowResults.forEach((result, index) => {
//       if (result.correct) {
//         score += letterRows[index].weight;
//       }
//       totalWeight += letterRows[index].weight;
//     });
//     return Math.round((score / totalWeight) * 20);
//   };
//   const isTestComplete = rowResults.every(
//     (row, index) => row.attempted || index > currentRowIndex
//   );
//   return (
//     <div className="p-6 bg-white rounded-lg shadow">
//       <div className="text-xl font-bold mb-4">Vision Test</div>
//       <div className="grid gap-4">
//         {letterRows.map((row, index) => (
//           <div key={index} className="flex items-center justify-between">
//             <span className="text-sm text-gray-500 w-16">{row.ratio}</span>
//             <span className={`${row.size} font-mono tracking-wider`}>
//               {row.letters}
//             </span>
//             <span className="w-16">
//               {rowResults[index].attempted && (
//                 <span
//                   className={
//                     rowResults[index].correct
//                       ? "text-green-500"
//                       : "text-red-500"
//                   }
//                 >
//                   {rowResults[index].correct ? "✓" : "✗"}
//                 </span>
//               )}
//             </span>
//           </div>
//         ))}

//         {!isTestComplete ? (
//           <div className="space-y-4">
//             <div className="mt-4">
//               <label className="block text-sm text-gray-600 mb-2">
//                 Enter the letters for row {currentRowIndex + 1} (
//                 {letterRows[currentRowIndex].ratio}):
//               </label>
//               <input
//                 type="text"
//                 value={userInput}
//                 onChange={(e) => setUserInput(e.target.value.toUpperCase())}
//                 maxLength={letterRows[currentRowIndex].letters.length}
//                 placeholder={`Enter ${letterRows[currentRowIndex].letters.length} letters`}
//                 className="w-full p-3 border rounded-lg text-center font-mono"
//                 autoFocus
//               />
//             </div>
//             <button
//               onClick={handleSubmitRow}
//               disabled={
//                 userInput.length !== letterRows[currentRowIndex].letters.length
//               }
//               className={`w-full py-3 rounded-lg font-semibold ${
//                 userInput.length === letterRows[currentRowIndex].letters.length
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-200 text-gray-500 cursor-not-allowed"
//               }`}
//             >
//               Submit Row
//             </button>
//           </div>
//         ) : (
//           <div className="mt-6 space-y-4">
//             <div className="bg-gray-50 rounded-lg p-4">
//               <h3 className="text-lg font-semibold mb-2">Test Results</h3>
//               {rowResults.map((result, index) => (
//                 <div
//                   key={index}
//                   className="flex justify-between items-center py-1"
//                 >
//                   <span>
//                     Row {index + 1} ({letterRows[index].ratio}):
//                   </span>
//                   <span
//                     className={
//                       result.correct ? "text-green-500" : "text-red-500"
//                     }
//                   >
//                     {result.userAnswer || "Skipped"}
//                   </span>
//                 </div>
//               ))}
//               <div className="mt-4 pt-4 border-t">
//                 <div className="text-lg font-semibold">
//                   Visual Acuity: {getVisualAcuity()}
//                 </div>
//                 <div className="text-lg font-semibold">
//                   Overall Score: {calculateOverallScore()} / 20
//                 </div>
//               </div>

//               {/* Save Test Section */}
//               <div className="mt-4 pt-4 border-t">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm text-gray-600 mb-2">
//                       Staff ID
//                     </label>
//                     <input
//                       type="text"
//                       value={staffId}
//                       onChange={(e) => setStaffId(e.target.value)}
//                       placeholder="Enter your staff ID"
//                       className="w-full p-3 border rounded-lg"
//                     />
//                   </div>
//                   <button
//                     onClick={() => {
//                       if (!staffId) {
//                         alert("Please enter Staff ID");
//                         return;
//                       }
//                       setSavedTests([
//                         ...savedTests,
//                         {
//                           timestamp: new Date().toISOString(),
//                           staffId,
//                           visualAcuity: getVisualAcuity(),
//                           score: calculateOverallScore(),
//                           rowResults: [...rowResults],
//                         },
//                       ]);
//                       setStaffId("");
//                     }}
//                     className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold"
//                   >
//                     Save Test Results
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={() => {
//                 setCurrentRowIndex(0);
//                 setUserInput("");
//                 setRowResults(
//                   letterRows.map(() => ({
//                     attempted: false,
//                     correct: false,
//                     userAnswer: "",
//                   }))
//                 );
//               }}
//               className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold"
//             >
//               Start New Test
//             </button>
//           </div>
//         )}

//         {/* Saved Tests History */}
//         {savedTests.length > 0 && (
//           <div className="mt-8 pt-6 border-t">
//             <h2 className="text-xl font-semibold mb-4">Test History</h2>
//             <div className="space-y-4">
//               {savedTests.map((test, index) => (
//                 <div key={index} className="bg-gray-50 rounded-lg p-4">
//                   <div className="font-semibold mb-2">
//                     Test {savedTests.length - index} -{" "}
//                     {new Date(test.timestamp).toLocaleString()}
//                   </div>
//                   <div className="text-sm space-y-2">
//                     <p>Staff ID: {test.staffId}</p>
//                     <p>Visual Acuity: {test.visualAcuity}</p>
//                     <p>Overall Score: {test.score} / 20</p>
//                     <div className="mt-2">
//                       <p className="font-medium">Row Results:</p>
//                       {test.rowResults.map((row, rowIndex) => (
//                         <div
//                           key={rowIndex}
//                           className="flex justify-between items-center text-xs"
//                         >
//                           <span>
//                             Row {rowIndex + 1} ({letterRows[rowIndex].ratio}):
//                           </span>
//                           <span
//                             className={
//                               row.correct ? "text-green-500" : "text-red-500"
//                             }
//                           >
//                             {row.userAnswer || "Skipped"}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// const VisionTestStation = () => {
//   const [activeTab, setActiveTab] = useState(0);
//   const tabs = ["Vision Test (Snellen Chart)", "Autorefractor Test"];
//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-center text-gray-800">
//           Vision Test Station
//         </h1>
//         <p className="text-center text-gray-600 mt-2">
//           Complete both tests in sequence
//         </p>
//       </div>
//       {/* Custom Tab Navigation */}
//       <div className="flex space-x-1 rounded-xl bg-blue-100 p-1 mb-6">
//         {tabs.map((tab, index) => (
//           <button
//             key={index}
//             onClick={() => setActiveTab(index)}
//             className={`flex-1 rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
//               ${
//                 activeTab === index
//                   ? "bg-white text-blue-700 shadow"
//                   : "text-blue-500 hover:bg-white/60 hover:text-blue-600"
//               }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>
//       {/* Tab Content */}
//       <div className="transition-opacity duration-300">
//         {activeTab === 0 ? <VisionTest /> : <AutorefractorTest />}
//       </div>
//       {/* Navigation Buttons */}
//       <div className="flex justify-between mt-8">
//         <button
//           onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
//           className={`px-6 py-2 border-2 border-blue-500 text-blue-500 rounded-lg font-medium
//             ${activeTab === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
//           disabled={activeTab === 0}
//         >
//           Previous Test
//         </button>
//         <button
//           onClick={() => setActiveTab(Math.min(1, activeTab + 1))}
//           className={`px-6 py-2 bg-blue-500 text-white rounded-lg font-medium
//             ${activeTab === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
//           disabled={activeTab === 1}
//         >
//           Next Test
//         </button>
//       </div>
//     </div>
//   );
// };
// export default VisionTest;
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

const VisionTest = () => {
  const letterRows = [
    { letters: "PTOC", ratio: "20/63", size: 36 },
    { letters: "ZLPED", ratio: "20/50", size: 32 },
    { letters: "ETODCF", ratio: "20/40", size: 28 },
    { letters: "DPCZLFT", ratio: "20/32", size: 24 },
    { letters: "LDCZOTEP", ratio: "20/20", size: 22 },
  ];

  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [userInput, setUserInput] = useState("");

  return (
    <View style={styles.testContainer}>
      <Text style={styles.sectionTitle}>Vision Test</Text>
      {letterRows.map((row, index) => (
        <View key={index} style={styles.rowContainer}>
          <Text style={styles.ratioText}>{row.ratio}</Text>
          <Text style={[styles.letterRow, { fontSize: row.size }]}>
            {row.letters}
          </Text>
        </View>
      ))}

      {/* Input & Submit */}
      <Text style={styles.inputLabel}>
        Enter the letters for row {currentRowIndex + 1} (
        {letterRows[currentRowIndex].ratio}):
      </Text>
      <TextInput
        style={styles.input}
        placeholder={`Enter ${letterRows[currentRowIndex].letters.length} letters`}
        value={userInput}
        onChangeText={setUserInput}
        autoCapitalize="characters"
      />
    </View>
  );
};

const AutorefractorTest = () => {
  return (
    <View style={styles.testContainer}>
      <Text style={styles.sectionTitle}>Autorefractor Test</Text>
      <Text style={styles.placeholderText}>
        This section is under development.
      </Text>
    </View>
  );
};

export default function VisionTestStation() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Vision Test (Snellen Chart)", "Autorefractor Test"];
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Vision Test Station</Text>
      <Text style={styles.subtitle}>Complete both tests in sequence</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === index && styles.activeTab]}
            onPress={() => setActiveTab(index)}
          >
            <Text
              style={
                activeTab === index ? styles.activeTabText : styles.tabText
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Switch between Snellen Chart & Autorefractor */}
      {activeTab === 0 ? <VisionTest /> : <AutorefractorTest />}

      {/* Navigation */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 0 && styles.disabled]}
          onPress={() => setActiveTab(0)}
          disabled={activeTab === 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 1 && styles.disabled]}
          onPress={() => setActiveTab(1)}
          disabled={activeTab === 1}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F2F2F7",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    padding: 5,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#777",
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  testContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  ratioText: {
    fontSize: 16,
    color: "#555",
    width: 50,
    textAlign: "right",
    marginRight: 10,
  },
  letterRow: {
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 4,
  },
  inputLabel: {
    fontSize: 16,
    color: "#555",
    marginTop: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 12,
    borderRadius: 10,
    width: "90%",
    textAlign: "center",
    marginTop: 5,
    fontSize: 16,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },
  navButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  disabled: {
    backgroundColor: "#CCC",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    width: "60%",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
