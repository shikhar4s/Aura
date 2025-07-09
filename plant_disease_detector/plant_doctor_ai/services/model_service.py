# predictor/model_service.py

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
import json
import os
from django.conf import settings # Import Django settings

# =====================================================================================
# === Step 1: Model Class Definitions ===
# These must exactly match the definitions in your training/saving script.
# =====================================================================================

def accuracy(outputs, labels):
    _, preds = torch.max(outputs, dim=1)
    return torch.tensor(torch.sum(preds == labels).item() / len(preds))

class ImageClassificationBase(nn.Module):
    # These methods are not used during inference but are needed for the class structure.
    def training_step(self, batch): pass
    def validation_step(self, batch): pass
    def validation_epoch_end(self, outputs): pass
    def epoch_end(self, epoch, result): pass

def ConvBlock(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
             nn.BatchNorm2d(out_channels),
             nn.ReLU(inplace=True)]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)

class CNN_NeuralNet(ImageClassificationBase):
    def __init__(self, in_channels, num_diseases):
        super().__init__()
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))
        self.conv3 = ConvBlock(128, 256, pool=True)
        self.conv4 = ConvBlock(256, 512, pool=True)
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))
        self.classifier = nn.Sequential(nn.MaxPool2d(4),
                                       nn.Flatten(),
                                       nn.Linear(512, num_diseases))

    def forward(self, x):
        out = self.conv1(x)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out

# =====================================================================================
# === Step 2: The Model Service (Singleton Pattern) ===
# This class handles loading and inference using Django's settings.
# =====================================================================================

class ModelService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelService, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance

    def initialize(self):
        """
        Loads model artifacts from the 'deployment_artifacts' folder
        in the project's base directory.
        """
        print("Initializing model service...")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # --- KEY CHANGE: Use settings.BASE_DIR to build the path ---
        artifacts_dir = os.path.join(settings.BASE_DIR, 'deployment_artifacts')
        model_path = os.path.join(artifacts_dir, 'plant_disease_model.pth')
        classes_path = os.path.join(artifacts_dir, 'class_names.json')

        # Check if the artifact directory exists
        if not os.path.isdir(artifacts_dir):
            raise FileNotFoundError(
                f"The 'deployment_artifacts' directory was not found at {artifacts_dir}. "
                "Please ensure it is in your project's root directory (next to manage.py)."
            )

        # Load class names from the JSON file
        try:
            with open(classes_path, 'r') as f:
                self.class_names = json.load(f)
            num_classes = len(self.class_names)
            print(f"✅ Loaded {num_classes} class names.")
        except FileNotFoundError:
            raise RuntimeError(f"Class names file not found at {classes_path}")

        # Instantiate the model architecture
        self.model = CNN_NeuralNet(in_channels=3, num_diseases=num_classes)
        
        # Load the saved state dictionary into the model
        try:
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        except FileNotFoundError:
             raise RuntimeError(f"Model state_dict not found at {model_path}")

        # Set the model to the correct device and evaluation mode
        self.model.to(self.device)
        self.model.eval()
        
        print(f"✅ Model loaded successfully on device: {self.device}")

    def _preprocess_image(self, image_file):
        """Transforms an uploaded image file into a tensor for the model."""
        transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor()
        ])
        image = Image.open(image_file).convert('RGB')
        return transform(image).unsqueeze(0)

    def predict(self, image_file):
        """
        Performs inference on a single image file.

        Args:
            image_file: A file-like object (e.g., from request.FILES).

        Returns:
            dict: A dictionary containing the predicted disease name and the
                  confidence score as a float.
                  e.g., {"disease": "Tomato___Late_blight", "confidence": 0.89}
        """
        # Preprocess the image and get the tensor
        tensor = self._preprocess_image(image_file).to(self.device)

        with torch.no_grad():
            # 1. Get the raw model output (logits)
            outputs = self.model(tensor)

            # 2. Apply Softmax to get probabilities
            # The outputs are raw scores (logits). Softmax converts them to probabilities.
            probabilities = F.softmax(outputs, dim=1)
            
            # 3. Get the top probability and its corresponding class index
            # torch.max returns a tuple of (max_value, max_indices)
            confidence, predicted_idx = torch.max(probabilities, 1)

            # 4. Map the index to the class name
            predicted_class = self.class_names[predicted_idx.item()]
            
            # 5. Format the confidence score
            # .item() extracts the scalar value from the tensor
            # We round it to 4 decimal places for a cleaner output
            confidence_score = round(confidence.item(), 4)

        # 6. Create the result dictionary
        prediction = {
            "disease": predicted_class,
            "confidence": confidence_score
        }
        
        return prediction

# =====================================================================================
# === Step 3: Instantiate the Service ===
# This creates the single, shared instance when Django starts.
# =====================================================================================
model_service = ModelService()