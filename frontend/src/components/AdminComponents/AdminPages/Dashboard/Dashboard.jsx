import axiosInstance, {
  updateAuthorizationHeader,
} from "../../../../Service/api";

export default function Dashboard() {
  return (
    <div
      onClick={() => {
        updateAuthorizationHeader("admin");
        axiosInstance.get("/admin/user-details");
      }}
    >
      dashboard
    </div>
  );
}
