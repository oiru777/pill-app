import { HStack, Button } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <HStack mb={4}>
      <Button
        leftIcon={<ArrowLeft size={20} />}
        variant="ghost"
        onClick={handleClick}
      >
        戻る
      </Button>
    </HStack>
  );
};

export default BackButton;
