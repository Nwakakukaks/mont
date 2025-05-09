/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

interface FormState {
  form: {
    id?: string;
    creatorId: string;
    form_title?: string;
    form_ad: boolean;
  };
  design: {
    logo: {
      file: File | null;
      preview: string | null;
    };
    background: {
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
  customerInputs: {
    name: string | null;
    projectName: string | null;
    email: string | null;
    walletAddress: string | null;
    photo: string | null;
    nationality: string | null;
    comment: string | null;
  };
  thanks: {
    title: string;
    message: string;
  };
  socialHandle: {
    profile: {
      name: string;
      handle: string;
      following: number;
      followers: number;
      bio: string;
    };
    tweets: Array<{
      id: string;
      content: string;
      videoUrl: string;
      likes: number;
      retweets: number;
      replies: number;
      timestamp: string;
    }>;
  };
}

const initialFormState: FormState = (() => {
  const storedData = sessionStorage.getItem("formState");
  if (storedData) {
    const { formState } = JSON.parse(storedData);
    sessionStorage.removeItem("formState");
    return formState;
  }

  return {
    form: {
      id: "",
      creatorId: "",
      form_title: "My new form",
      form_ad: false,
    },
    design: {
      logo: {
        file: null,
        preview: null,
      },
      background: {
        file: null,
        preview:
          "https://utfs.io/f/PKy8oE1GN2J3t4MUvdkvpN1sulgB5tndmrzYhToROK9e3EVa",
      },
      primaryColor: "#6D28D9",
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
        projectName: { required: false, enabled: true },
        email: { required: true, enabled: true },
        walletAddress: { required: false, enabled: true },
        photo: { required: false, enabled: true },
        nationality: { required: false, enabled: true },
        comment: { required: false, enabled: true },
      },
    },
    customerInputs: {
      name: "",
      projectName: "",
      email: "",
      walletAddress: "",
      photo: "",
      nationality: "",
      comment: "",
    },
    thanks: {
      title: "Thanks for leaving us feedback 🙏",
      message:
        "Thank you so much for your support! We appreciate your support and participation in making our hackathon better!",
    },
    socialHandle: {
      profile: {
        name: "Mont Protocol",
        handle: "MontProtocol",
        following: 420,
        followers: 15200,
        bio: "Building the future of institutional DeFi lending | Security-first approach | Cross-chain enabled",
      },
      tweets: [
        {
          id: "1",
          content:
            "✨ Masterpiece alert! Ready to shine? Click the sparkly 'Get Form' button and let's create! ✨ #ContentCreation #Engagement",
          videoUrl: "/placeholder-video-1.mp4",
          likes: 1200,
          retweets: 450,
          replies: 89,
          timestamp: "2h",
        },
      ],
    },
  };
})();

interface FormContextType {
  formState: FormState;
  formDate: Date;
  forms: { id: string; name: string | null; formState: FormState }[];
  onboardingForms: { id: string; name: string | null; formState: FormState }[];
  handleLogoUpload: (file: File) => void;
  handleBackgroundUpload: (file: File) => void;
  updateWelcome: (updates: Partial<FormState["welcome"]>) => void;
  updateForm: (updates: Partial<FormState["form"]>) => void;
  updateDesign: (updates: Partial<FormState["design"]>) => void;
  updateFormState: (
    section: keyof FormState,
    newData: Partial<FormState[keyof FormState]>
  ) => void;
  updateResponse: (updates: Partial<FormState["response"]>) => void;
  updateCustomer: (updates: Partial<FormState["customerInputs"]>) => void;
  setRating: (rating: number) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  expandedItem: string | null;
  setExpandedItem: (item: string | null) => void;
  isDesktop: boolean;
  setIsDesktop: (isDesktop: boolean) => void;
  saveForm: () => Promise<void>;
  saveOnboardingForm: () => Promise<void>;
  loadForm: (id: string) => Promise<boolean>;
  loadOnboardingForm: (id: string) => Promise<boolean>;
  loadForms: () => Promise<void>;
  loadOnboardingForms: () => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  deleteOnboardingForm: (id: string) => Promise<void>;
  updateSocialHandle: (updates: Partial<FormState["socialHandle"]>) => void;
}

const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [forms, setForms] = useState<
    { id: string; name: string | null; formState: FormState }[]
  >([]);
  const [onboardingForms, setOnboarding] = useState<
    { id: string; name: string | null; formState: FormState }[]
  >([]);
  const [activeView, setActiveView] = useState<string>("design");
  const [expandedItem, setExpandedItem] = useState<string | null>("design");
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const saveForm = async () => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("forms").upsert(
        {
          id: formState.form.id || crypto.randomUUID(),
          form_title: formState.form.form_title,
          user_id: user.id,
          form_state: formState,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Changes saved successfully",
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

  const saveOnboardingForm = async () => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("onboarding_forms").upsert(
        {
          id: formState.form.id || crypto.randomUUID(),
          form_title: formState.form.form_title,
          user_id: user.id,
          form_state: formState,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Changes saved successfully",
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
      const { data: formsData } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();

      if (formsData) {
        setFormState(formsData.form_state);
        setFormDate(new Date(formsData.updated_at));
        return true;
      }

      return await loadOnboardingForm(id);
    } catch (error) {
      console.error("Error loading form:", error);
      return false;
    }
  };

  const loadOnboardingForm = async (id: string) => {
    try {
      const { data: onboardingData } = await supabase
        .from("onboarding_forms")
        .select("*")
        .eq("id", id)
        .single();

      if (onboardingData) {
        setFormState(onboardingData.form_state);
        setFormDate(new Date(onboardingData.updated_at));
        return true;
      }

      console.log("No form found with the given ID");
      return false;
    } catch (error) {
      console.error("Error loading onboarding form:", error);
      return false;
    }
  };

  const loadOnboardingForms = async () => {
    try {
      const { data, error } = await supabase
        .from("onboarding_forms")
        .select("id, form_title, form_state")
        .eq("user_id", user?.id);

      if (error) throw error;
      if (data) {
        const forms = data?.map(
          (form: {
            id: string;
            form_title: string | null;
            form_state: FormState;
          }) => ({
            id: form.id,
            name: form.form_title || null,
            formState: form.form_state,
          })
        );
        setOnboarding(forms || []);
      }
    } catch (error) {
      console.error("Error loading forms:", error);
    }
  };

  const loadForms = async () => {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("id, form_title, form_state")
        .eq("user_id", user?.id);

      if (error) throw error;
      if (data) {
        const forms = data?.map(
          (form: {
            id: string;
            form_title: string | null;
            form_state: FormState;
          }) => ({
            id: form.id,
            name: form.form_title || null,
            formState: form.form_state,
          })
        );
        setForms(forms || []);
      }
    } catch (error) {
      console.error("Error loading forms:", error);
    }
  };

  const handleLogoUpload = async (file: File) => {
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

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "mont_uploads");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dgz4c3ahz/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      updateFormState("design", {
        logo: {
          file: file,
          preview: data.secure_url,
        },
      });
      console.log('Logo uploaded successfully')
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
  };

  const handleBackgroundUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateFormState("design", {
        background: {
          file: file,
          preview: reader.result as string,
        },
      });
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "mont_uploads");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dgz4c3ahz/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      updateFormState("design", {
        background: {
          file: file,
          preview: data.secure_url,
        },
      });
      console.log('Logo uploaded successfully')
    } catch (error) {
      console.error("Error uploading background:", error);
    }
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

  const updateDesign = (updates: Partial<FormState["design"]>) => {
    setFormState((prev) => ({
      ...prev,
      design: {
        ...prev.design,
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

  const updateCustomer = (updates: Partial<FormState["customerInputs"]>) => {
    setFormState((prev) => ({
      ...prev,
      customerInputs: {
        ...prev.customerInputs,
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

  const deleteForm = async (id: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("forms").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      });
    }
  };

  const deleteOnboardingForm = async (id: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("onboarding_forms")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      });
    }
  };

  const updateSocialHandle = (updates: Partial<FormState["socialHandle"]>) => {
    setFormState((prev) => ({
      ...prev,
      socialHandle: {
        ...prev.socialHandle,
        ...updates,
      },
    }));
  };

  return (
    <FormContext.Provider
      value={{
        formState,
        onboardingForms,
        loadOnboardingForms,
        saveOnboardingForm,
        deleteOnboardingForm,
        formDate,
        handleLogoUpload,
        updateSocialHandle,
        handleBackgroundUpload,
        updateWelcome,
        updateForm,
        updateDesign,
        updateResponse,
        updateCustomer,
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
        loadOnboardingForm,
        forms,
        loadForms,
        deleteForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
