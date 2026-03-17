import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, User, Home, Settings, FileText } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userNIK, setUserNIK] = useState("");

  useEffect(() => {
    // Cek apakah user sudah login sebagai admin
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");
    if (!isLoggedIn || role !== "admin") {
      navigate("/");
      return;
    }

    const nik = localStorage.getItem("userNIK") || "";
    setUserNIK(nik);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userNIK");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-700 shadow-sm border-b border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="hidden sm:block ml-1">
                <p className="text-white font-bold text-sm leading-tight">BRIDA Kota Surabaya</p>
                <p className="text-red-200 text-xs">Dashboard User</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Admin Landing */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Halaman Admin
          </button>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Halo, Administrator!</h2>
              <p className="text-red-100">Panel Manajemen BRIDA Kota Surabaya</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Dokumen</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pengajuan Aktif</p>
                <p className="text-3xl font-bold text-gray-900">5</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Terselesaikan</p>
                <p className="text-3xl font-bold text-gray-900">28</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { title: "Pengajuan dokumen berhasil", time: "2 jam yang lalu", status: "success" },
                { title: "Verifikasi identitas selesai", time: "5 jam yang lalu", status: "success" },
                { title: "Dokumen dalam proses review", time: "1 hari yang lalu", status: "pending" },
                { title: "Profile diperbarui", time: "2 hari yang lalu", status: "info" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${activity.status === "success" ? "bg-green-500" :
                    activity.status === "pending" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
