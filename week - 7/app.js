import { useState } from "react";
import StudentContext from "./StudentContext";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import "./App.css";

function App() {

    const [students, setStudents] = useState([]);

    return (
        <StudentContext.Provider
            value={{ students, setStudents }}
        >
            <div className="app-container">

                <div className="card">

                    <h1 className="main-title">
                        🎓 Student Management System
                    </h1>

                    <StudentForm />
                    <StudentList />

                </div>

            </div>
        </StudentContext.Provider>
    );
}

export default App;