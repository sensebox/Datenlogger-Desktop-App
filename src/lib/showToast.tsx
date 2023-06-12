import { useToast } from "@/components/ui/use-toast";

const showToast = (title: string, message: string, mode: string) => {
  const { toast } = useToast();
  switch (mode) {
    case "error":
      toast({
        variant: "destructive",
        title: `${title}`,
        description: `${message}`,
      });
      break;
    case "success":
      toast({
        title: `${title}`,
        description: `${message}`,
      });
      break;
    default:
      toast({
        title: `${title}`,
        description: `${message}`,
      });
      break;
  }
};

export default showToast;
