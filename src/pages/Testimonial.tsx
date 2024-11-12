
import { ArrowLeftIcon, ChevronDown, Layout } from "lucide-react";
import { MobileIcon } from "@radix-ui/react-icons";
import { navItems } from "../components/general/navItems";
import { useFormContext } from '@/context/FormContext';


// Main TestimonialForm component
const TestimonialForm = () => {
  const {
    formState,
    activeView,
    setActiveView,
    expandedItem,
    setExpandedItem,
    isDesktop,
    setIsDesktop
  } = useFormContext();

  const ActiveComponent = navItems.find(
    (item) => item.id === activeView
  )?.component;
  const ActiveSettings = navItems.find(
    (item) => item.id === expandedItem
  )?.settings;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Left Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center mb-6 text-gray-500">
          <button className="mr-2">
            <ArrowLeftIcon size={14} />
          </button>
          <h1 className="text-sm">Forms</h1>
        </div>

        <div className="flex items-center mb-6">
          <h1 className="text-lg font-medium line-clamp-1">
            REDACTED Hackathon
          </h1>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <div key={item.id} className="border-b border-gray-100">
              <button
                onClick={() => {
                  setExpandedItem(expandedItem === item.id ? null : item.id);
                  setActiveView(item.id);
                }}
                className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg text-sm"
              >
                <span className="mr-3">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                  className={`transform transition-transform ${
                    expandedItem === item.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedItem === item.id && ActiveSettings && (
                <div className="p-4 bg-gray-50">
                  <ActiveSettings />
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="w-full bg-black text-white rounded-lg py-2 mt-6">
          Save changes
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gradient-to-br from-purple-500 to-blue-900 flex flex-col">
        <div className="flex justify-end mb-6">
          <div className="bg-white rounded-lg p-[5px] flex gap-1">
            <button
              onClick={() => setIsDesktop(true)}
              className={`p-[4px] rounded-md ${isDesktop ? "bg-gray-200" : ""}`}
            >
              <Layout size={20} />
            </button>
            <button
              onClick={() => setIsDesktop(false)}
              className={`p-[4px] rounded-md ${!isDesktop ? "bg-gray-200" : ""}`}
            >
              <MobileIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center flex-grow mb-10">
          {ActiveComponent && (
            <ActiveComponent 
              isDesktop={isDesktop} 
              {...formState[activeView as keyof typeof formState]} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialForm;