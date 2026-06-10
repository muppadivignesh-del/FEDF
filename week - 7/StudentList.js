import { useContext } from "react";
import StudentContext from "../StudentContext";

function StudentList() {

    const { students } = useContext(StudentContext);

    return (
        <div className="list-container">

            <h3 className="section-title">
                📚 Student List
            </h3>

            <ul className="student-list">

                {students.map((student, index) => (
                    <li
                        key={index}
                        className="student-item"
                    >
                        🌟 {student}
                    </li>
                ))}

            </ul>

        </div>
    );
}

export default StudentList;