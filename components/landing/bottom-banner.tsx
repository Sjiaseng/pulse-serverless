import { Users } from "lucide-react";

export default function BottomBanner() {
    return (
        <section id="bottom-banner">
            <div className="mt-20 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-gradient-to-br from-[#F5BE66] to-[#F5BE66]/90 rounded-3xl p-12 shadow-xl relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                            <div className="relative z-10 text-center">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                                    <Users className="w-4 h-4 text-white" />
                                    <span className="font-montserrat text-sm font-medium text-white">Join Our Community</span>
                                </div>

                                <h3 className="font-dela-gothic text-3xl sm:text-4xl text-white mb-4">
                                    Ready to Transform Your Heart Health?
                                </h3>

                                <p className="font-montserrat text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                                    Join thousands of users who are already improving their cardiovascular health through our gamified
                                    approach.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <button className="bg-white text-[#F5BE66] font-montserrat font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                        Download App
                                    </button>
                                    <button className="border-2 border-white text-white font-montserrat font-semibold px-8 py-4 rounded-2xl hover:bg-white hover:text-[#F5BE66] transition-all duration-300">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}