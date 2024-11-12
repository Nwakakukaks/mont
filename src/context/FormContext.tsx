import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

// Define the types for our form state
interface FormState {
  form: {
    id?: string;
    form_title?: string;
  };
  design: {
    logo: {
      file: File | null;
      preview: string | null;
    };
    primaryColor: string;
    backgroundColor: string;
    font: string;
    gradient: {
      from: string;
      to: string;
    };
  };
  welcome: {
    title: string;
    subtitle: string;
    prompts: string;
    buttonText: string;
    showTestimonialButton: boolean;
  };
  response: {
    title: string;
    prompts: string;
    enableRating: boolean;
    rating: number | null;
    videoPreview: string | null;
    videoUrl: string | null;
    recordingTime: string;
  };
  customer: {
    fields: {
      name: { required: boolean; enabled: boolean };
      projectName: { required: boolean; enabled: boolean };
      email: { required: boolean; enabled: boolean };
      walletAddress: { required: boolean; enabled: boolean };
      photo: { required: boolean; enabled: boolean };
      nationality: { required: boolean; enabled: boolean };
      comment: { required: boolean; enabled: boolean };
    };
  };
  thanks: {
    title: string;
    message: string;
  };
}

// Create the initial state
const initialFormState: FormState = {
  form: {
    id: "",
    form_title: "My new form",
  },
  design: {
    logo: {
      file: null,
      preview: null,
    },
    primaryColor: "#6D28D9", // purple-700
    backgroundColor: "#ffffff",
    font: "Roboto Mono",
    gradient: {
      from: "#9333EA",
      to: "#1E3A8A",
    },
  },
  welcome: {
    title: "Share a testimonial!",
    subtitle: "Do you love using our product? We'd love to hear about it!",
    prompts:
      "- Share your experience with a quick video testimonial\n- Recording a video? Don't forget to smile 😊",
    buttonText: "Record a video",
    showTestimonialButton: false,
  },
  response: {
    title: "Record a video feedback",
    prompts:
      "- What do you like about Mont?\n- Would you recommend Mont to a friend?",
    enableRating: true,
    rating: null,
    videoPreview: null,
    videoUrl: null,
    recordingTime: "00:00",
  },
  customer: {
    fields: {
      name: { required: true, enabled: true },
      projectName: { required: true, enabled: true },
      email: { required: true, enabled: true },
      walletAddress: { required: false, enabled: true },
      photo: { required: false, enabled: true },
      nationality: { required: false, enabled: true },
      comment: { required: false, enabled: true },
    },
  },
  thanks: {
    title: "Thanks for leaving us feedback 🙏",
    message:
      "Thank you so much for your support! We appreciate your support and participation in making our hackathon better!",
  },
};

// Create the context
interface FormContextType {
  formState: FormState;
  forms: { id: string; name: string | null }[];
  handleLogoUpload: (file: File) => void;
  updateWelcome: (updates: Partial<FormState["welcome"]>) => void;
  updateForm: (updates: Partial<FormState["form"]>) => void;
  updateFormState: (
    section: keyof FormState,
    newData: Partial<FormState[keyof FormState]>
  ) => void;
  updateResponse: (updates: Partial<FormState["response"]>) => void;
  setRating: (rating: number) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  expandedItem: string | null;
  setExpandedItem: (item: string | null) => void;
  isDesktop: boolean;
  setIsDesktop: (isDesktop: boolean) => void;
  saveForm: () => Promise<void>;
  loadForm: (id: string) => Promise<void>;
  loadForms: () => Promise<void>;
}

const FormContext = createContext<FormContextType | null>(null);

// Create a custom hook to use the form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

// Create the provider component
export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [forms, setForms] = useState<{ id: string; name: string | null }[]>([]);
  const [activeView, setActiveView] = useState<string>("design");
  const [expandedItem, setExpandedItem] = useState<string | null>("design");
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const saveForm = async () => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("forms").upsert({
        id: formState.form.id || crypto.randomUUID(),
        form_title: formState.form.form_title,
        user_id: user.id,
        form_state: formState,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form saved successfully",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive",
      });
    }
  };

  const loadForm = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setFormState(data.form_state);
      }
    } catch (error) {
      console.error("Error loading form:", error);
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive",
      });
    }
  };

  const loadForms = async () => {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("id, form_title")
        .eq("user_id", user?.id);

      if (error) throw error;
      if (data) {
        const forms = data?.map(
          (form: { id: string; form_title: string | null }) => ({
            id: form.id,
            name: form.form_title || null,
          })
        );
        setForms(forms || []);
      }
    } catch (error) {
      console.error("Error loading forms:", error);
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateFormState("design", {
        logo: {
          file: file,
          preview: reader.result as string,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const updateWelcome = (updates: Partial<FormState["welcome"]>) => {
    setFormState((prev) => ({
      ...prev,
      welcome: {
        ...prev.welcome,
        ...updates,
      },
    }));
  };

  const updateForm = (updates: Partial<FormState["form"]>) => {
    setFormState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        ...updates,
      },
    }));
  };

  const updateResponse = (updates: Partial<FormState["response"]>) => {
    setFormState((prev) => ({
      ...prev,
      response: {
        ...prev.response,
        ...updates,
      },
    }));
  };

  const setRating = (rating: number) => {
    setFormState((prev) => ({
      ...prev,
      response: {
        ...prev.response,
        rating,
      },
    }));
  };

  const updateFormState = (
    section: keyof FormState,
    newData: Partial<FormState[keyof FormState]>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        ...(newData as object),
      },
    }));
  };

  return (
    <FormContext.Provider
      value={{
        formState,
        handleLogoUpload,
        updateWelcome,
        updateForm,
        updateResponse,
        setRating,
        updateFormState,
        activeView,
        setActiveView,
        expandedItem,
        setExpandedItem,
        isDesktop,
        setIsDesktop,
        saveForm,
        loadForm,
        forms,
        loadForms,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
