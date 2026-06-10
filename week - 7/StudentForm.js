import { useState, useContext } from "react";
import StudentContext from "../StudentContext";

function StudentForm() {

    const [name, setName] = useState("");

    const { students, setStudents } = useContext(StudentContext);

    const addStudent = () => {

        if(name.trim() === "") return;

        setStudents([...students, name]);
        setName("");
    };

    return (
        <div className="form-container">

            <h3 className="section-title">
                ➕ Add Student
            </h3>

            <div className="input-group">

                <input
                    type="text"
                    value={name}
                    placeholder="Enter Student Name"
                    onChange={(e) => setName(e.target.value)}
                    className="student-input"
                />

                <button
                    onClick={addStudent}
                    className="add-btn"
                >
                    Add
                </button>

            </div>

        </div>
    );
}

export default StudentForm;