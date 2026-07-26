import React, { useEffect, useState } from "react";
import { Search, Package, MapPin, Clock, ArrowLeft, Truck, Home, CheckCircle, AlertCircle } from "lucide-react";
import {FaUser} from "react-icons/fa";
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

interface TrackingEvent {
    status: string;
    date: string;
    description: string;
}

interface TrackingData {
    trackingNumber: string;
    status: string;
    customerName: string;
    address: string;
    estimatedDelivery: string;
    events: TrackingEvent[];
}

interface TrackingPageProps {
    lang: "fr" | "ar";
    onBackToHome: () => void;
    initialTrackingNumber?: string;
}

export default function TrackingPage({ lang, onBackToHome, initialTrackingNumber }: TrackingPageProps) {
    const [trackingNumber, setTrackingNumber] = useState<string>(initialTrackingNumber || "");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const getStatusDotColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes("livré") || statusLower.includes("delivered")) {
            return '#10b981'; // emerald-500
        }
        if (statusLower.includes("expédié") || statusLower.includes("shipped") || statusLower.includes("transit")) {
            return '#3b82f6'; // blue-500
        }
        if (statusLower.includes("prêt") || statusLower.includes("ready") || statusLower.includes("prepared")) {
            return '#f59e0b'; // amber-500
        }
        if (statusLower.includes("commande") || statusLower.includes("received") || statusLower.includes("reçue")) {
            return '#8b5cf6'; // purple-500
        }
        return '#94a3b8'; // slate-400
    };
    const isRTL = lang === "ar";

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        const code = trackingNumber.trim();
        if (!code) {
            setError(lang === "ar" ? "الرجاء إدخال رقم التتبع" : "Veuillez entrer un numéro de suivi");
            return;
        }

        setIsLoading(true);
        setError(null);
        setTrackingData(null);
        setHasSearched(true);

        try {
            const apiBase = process.env.VITE_API_URL || "http://localhost:3000";
            const response = await fetch(`${apiBase}/api/track`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ trackingCode: code })
            });

            if (!response.ok) {
                throw new Error("Tracking not found");
            }

            const data = await response.json();

            if (data.success) {
                const events = data.history || [];
                setTrackingData({
                    trackingNumber: data.trackingCode || code,
                    status: data.currentStatus || data.state?.name || "In transit",
                    customerName: data.clientName || data.customer?.name || "",
                    address: data.commune || data.deliveryAddress?.street || "",
                    estimatedDelivery: data.estimatedDelivery || "2-3 jours",
                    events: events.map((event: any) => ({
                        status: event.status || event.state || "",
                        date: event.date || "",
                        description: event.desc || event.description || ""
                    }))
                });
            } else {
                setError(data.error || (lang === "ar" ? "لم يتم العثور على الشحنة" : "Tracking not found"));
            }
        } catch (err) {
            setError(lang === "ar" ? "حدث خطأ أثناء البحث" : "An error occurred while searching");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialTrackingNumber && !hasSearched) {
            const timer = setTimeout(() => {
                handleSearch();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [initialTrackingNumber]);

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes("livré") || statusLower.includes("delivered")) {
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        }
        if (statusLower.includes("expédié") || statusLower.includes("shipped") || statusLower.includes("transit")) {
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        }
        if (statusLower.includes("prêt") || statusLower.includes("ready") || statusLower.includes("prepared")) {
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        }
        if (statusLower.includes("commande") || statusLower.includes("received") || statusLower.includes("reçue")) {
            return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
        }
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    };

    const translateStatus = (status: string, lang: string) => {
        if (lang === "fr") return status;

        // Arabic translations
        const translations: { [key: string]: string } = {
            "Commande reçue": "تم استلام الطلب",
            "Appel de confirmation": "تأكيد الاتصال",
            "Prêt à expédier": "جاهز للشحن",
            "Expédié": "تم الشحن",
            "En transit": "في النقل",
            "En cours de livraison": "جاري التوصيل",
            "Livré": "تم التوصيل",
            "Commande en traitement": "الطلب قيد المعالجة",
            "Transition": "انتقال",
            "Unknown": "غير معروف"
        };

        // Check for exact match
        if (translations[status]) {
            return translations[status];
        }

        // Check for partial matches
        const statusLower = status.toLowerCase();
        if (statusLower.includes("reçue") || statusLower.includes("received")) return "تم الاستلام";
        if (statusLower.includes("appel") || statusLower.includes("call")) return "اتصال تأكيدي";
        if (statusLower.includes("prêt") || statusLower.includes("ready")) return "جاهز للشحن";
        if (statusLower.includes("expédié") || statusLower.includes("shipped")) return "تم الشحن";
        if (statusLower.includes("transit")) return "في النقل";
        if (statusLower.includes("livraison") || statusLower.includes("delivery")) return "جاري التوصيل";
        if (statusLower.includes("livré") || statusLower.includes("delivered")) return "تم التوصيل";
        if (statusLower.includes("traitement") || statusLower.includes("processing")) return "قيد المعالجة";

        return status;
    };
    const formatDate = (dateString: string, lang: string) => {
        const d = new Date(dateString);
        if (lang === "ar") {
            // Arabic format
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } else {
            // French format
            return d.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={onBackToHome}
                    className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all duration-200 mb-6"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>{lang === "ar" ? "العودة إلى الرئيسية" : "Retour à l'accueil"}</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {lang === "ar" ? "تتبع شحنتك" : "Suivi de colis"}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {lang === "ar" ? "أدخل رقم التتبع الخاص بك لمتابعة حالة الشحنة" : "Entrez votre numéro de suivi pour suivre votre colis"}
                    </p>
                </div>

                {/* Search Input */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder={lang === "ar" ? "مثال: 07-QA9YNCLR90-ZR" : "Ex: 07-QA9YNCLR90-ZR"}
                                className={`w-full rounded-xl border-2 px-4 py-3 pr-10 text-sm bg-white dark:bg-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                    error
                                        ? "border-red-300 focus:ring-red-200"
                                        : "border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-emerald-200"
                                }`}
                                dir="ltr"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>{lang === "ar" ? "جاري البحث..." : "Recherche..."}</span>
                                </>
                            ) : (
                                <span>{lang === "ar" ? "تتبع" : "Suivre"}</span>
                            )}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </form>

                {/* Tracking Results */}
                {trackingData && (
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 p-6 sm:p-8 animate-fadeIn">
                        {/* Summary Card */}
                        <div className="mb-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        {lang === "ar" ? "رقم التتبع" : "Numéro de suivi"}
                                    </p>
                                    <p className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1">
                                        {trackingData.trackingNumber}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        {lang === "ar" ? "الحالة" : "Statut"}
                                    </p>
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(trackingData.status)} mt-1`}>
                                        {trackingData.status}
                                    </span>
                                </div>
                            </div>
                            {trackingData.customerName && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <FaUser className="h-4 w-4" />
                                    <span>{trackingData.customerName}</span>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                                {lang === "ar" ? "تاريخ التتبع" : "Historique de suivi"}
                            </h3>
                            <div className="relative">
                                {trackingData.events.length > 0 ? (
                                    <VerticalTimeline layout="1-column-left" lineColor="#e2e8f0">
                                        {trackingData.events.map((event, index) => (
                                            <VerticalTimelineElement
                                                key={index}
                                                date={formatDate(event.date, lang)}
                                                dateClassName={isRTL ? 'text-right' : 'text-left'}
                                                contentClassName={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 ${isRTL ? 'text-right' : 'text-left'}`}
                                                iconStyle={{
                                                    background: getStatusDotColor(event.status),
                                                    color: '#fff',
                                                    boxShadow: '0 0 0 4px white, 0 0 0 6px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                                        {translateStatus(event.status, lang)}
                                                    </p>
                                                </div>
                                            </VerticalTimelineElement>
                                        ))}
                                    </VerticalTimeline>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                        {lang === "ar" ? "لا توجد أحداث حتى الآن" : "Aucun événement pour le moment"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!trackingData && !error && !isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Package className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {lang === "ar"
                                ? "أدخل رقم التتبع أعلاه لمتابعة شحنتك"
                                : "Entrez votre numéro de suivi ci-dessus pour suivre votre colis"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}