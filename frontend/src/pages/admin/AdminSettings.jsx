import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Settings, Shield, Bell, Database, Globe, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const AdminSettings = () => {
    const [settings, setSettings] = React.useState({
        enforce_strong_password: "false",
        enable_2fa: "false",
        platform_name: "SmartLearning Platform",
        support_email: "support@smartlearning.ai"
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await adminService.getSettings();
            setSettings(prev => ({...prev, ...data.settings}));
        } catch (err) {
            toast.error("Failed to load system settings");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (updatedSettings = settings) => {
        try {
            await adminService.updateSettings(updatedSettings);
            toast.success("System Configuration Updated");
        } catch (err) {
            toast.error("Failed to save settings");
        }
    };

    const toggleSetting = (key) => {
        const newValue = settings[key] === "true" ? "false" : "true";
        const newSettings = { ...settings, [key]: newValue };
        setSettings(newSettings);
        handleSave(newSettings);
    };

    if (loading) return <AdminLayout><div className="flex justify-center py-40"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            Global Config
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-gray-500 font-medium mt-1">Configure platform behavior and security protocols.</p>
                </div>
                <button 
                    onClick={() => handleSave()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                            <Globe className="text-blue-600" /> Platform Identity
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Platform Name</label>
                                <input 
                                    name="platform_name"
                                    type="text" 
                                    value={settings.platform_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Support Email</label>
                                <input 
                                    name="support_email"
                                    type="email" 
                                    value={settings.support_email}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                            <Shield className="text-emerald-600" /> Security & Access
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                <div>
                                    <div className="font-black text-gray-900">Enforce Strong Passwords</div>
                                    <div className="text-xs text-gray-500 font-medium">Require symbols and numbers for all users.</div>
                                </div>
                                <button 
                                    onClick={() => toggleSetting('enforce_strong_password')}
                                    className={`h-6 w-12 rounded-full relative transition-colors ${settings.enforce_strong_password === "true" ? 'bg-blue-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${settings.enforce_strong_password === "true" ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                <div>
                                    <div className="font-black text-gray-900">Two-Factor Authentication</div>
                                    <div className="text-xs text-gray-500 font-medium">Add an extra layer of security for admins.</div>
                                </div>
                                <button 
                                    onClick={() => toggleSetting('enable_2fa')}
                                    className={`h-6 w-12 rounded-full relative transition-colors ${settings.enable_2fa === "true" ? 'bg-blue-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${settings.enable_2fa === "true" ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Database Info */}
                    <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <Database className="absolute -right-5 -bottom-5 h-24 w-24 text-white/5" />
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            System Status
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Database</div>
                                <div className="text-sm font-bold">PostgreSQL / SQLAlchemy</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Storage used</div>
                                <div className="text-sm font-bold">1.2 GB / 10 GB</div>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Backup Database
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notification Config */}
                    <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100">
                        <h3 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-3">
                            <Bell className="text-blue-600" /> Alerts
                        </h3>
                        <p className="text-sm text-blue-700/70 font-medium mb-8">
                            Configure how you receive critical system updates and security alerts.
                        </p>
                        <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline underline-offset-8">
                            Configure Webhooks
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
