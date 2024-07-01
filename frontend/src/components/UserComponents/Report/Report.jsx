import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { postReport } from "../../../Service/Apiservice/UserApi";

export default function Report({ reportData, onClose }) {
  const [error, setError] = useState(false);
  const [reportError, setReportError] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState({
    culprit: reportData.culprit,
    type: reportData.type,
    contentId: reportData.contentId,
    reportedBy: reportData.userId,
    reason: "",
  });

  const handleReport = async () => {
    try {
      setLoading(true);
      if (report.reason.trim() == "") {
        setError(true);
        setLoading(false);
        return;
      }
      if (report.reason.length < 18) {
        setError(true);
        setReportError("reason is too short");
        setLoading(false);

        return;
      }

      const response = await postReport(report);
      if (response === true) {
        showSuccessToast(`Reported  ${report.type} sucessfully`);

        onClose();
      } else {
        showErrorToast(response);
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-w-[400px] py-5 px-6 fit-content">
      <div className="sm:col-span-3">
        <label
          htmlFor="last-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Email
        </label>
        <div className="mt-2">
          <input
            readOnly={true}
            type="text"
            value={reportData.email}
            name="last-name"
            id="last-name"
            autoComplete="family-name"
            className="block ps-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="sm:col-span-3">
        <label
          htmlFor="last-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          username
        </label>
        <div className="mt-2">
          <input
            readOnly={true}
            value={reportData.userName}
            type="text"
            name="last-name"
            id="last-name"
            autoComplete="family-name"
            className="block ps-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="about"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Provide your reason
        </label>
        <div className="mt-2">
          <textarea
            onChange={(e) => {
              setReportError("");
              setError(false);
              setReport((prev) => ({ ...prev, reason: e.target.value }));
            }}
            id="about"
            name="about"
            rows={3}
            className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div
        className={` ${
          error ? "" : "opacity-0 "
        } text-xs text-red-400 transition duration-400`}
      >
        {reportError ? reportError : "field is required"}
      </div>
      <div className="my-1 text-gray-500">
        <FontAwesomeIcon className="text-red-300" icon={faCircleExclamation} />
        <span className="text-xs ms-2 ">
          Your report will be submitted anonymously, and the user will not be
          notified
        </span>
      </div>
      <div className="mt-3 flex justify-center">
        <button
          onClick={handleReport}
          className="font-semibold flex justify-center items-center text-[#ffffff] rounded-lg min-w-32 min-h-9  bg-[#512da8] uppercase text-sm py-1 "
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            "report"
          )}
        </button>
      </div>
    </div>
  );
}
