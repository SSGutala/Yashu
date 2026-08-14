import cv2
import numpy as np

# Load the image
img_path = '/Users/saigutala/.gemini/antigravity-ide/brain/bb9e6c4a-cd46-46a7-aa90-72a8238c1d4b/media__1785265396738.jpg'
img = cv2.imread(img_path)
h, w = img.shape[:2]

# Scale down for fast GrabCut
scale = 300.0 / w
w_small = 300
h_small = int(h * scale)
img_small = cv2.resize(img, (w_small, h_small))

# Create mask initialized to probable background
mask = np.ones((h_small, w_small), np.uint8) * cv2.GC_PR_BGD

# Probable foreground region (bounding box of the model)
x1, y1 = int(w_small * 0.20), int(h_small * 0.02)
x2, y2 = int(w_small * 0.80), int(h_small * 0.98)
mask[y1:y2, x1:x2] = cv2.GC_PR_FGD

# Mark sure background for the top-most band (above the head)
mask[0:int(h_small * 0.07), :] = cv2.GC_BGD

# Sure background corners and edges to remove street background
# Top-left corner background
mask[0:int(h_small * 0.25), 0:int(w_small * 0.42)] = cv2.GC_BGD

# Top-right corner background
mask[0:int(h_small * 0.25), int(w_small * 0.58):w_small] = cv2.GC_BGD
# Left-edge background (excluding bottom dress expansion)
mask[int(h_small * 0.25):int(h_small * 0.70), 0:int(w_small * 0.28)] = cv2.GC_BGD
# Right-edge background (excluding bottom dress expansion)
mask[int(h_small * 0.25):int(h_small * 0.70), int(w_small * 0.72):w_small] = cv2.GC_BGD

# Sure foreground: ONLY the absolute inner core of head to avoid keeping background halos
head_x = int(w_small * 0.50)
head_y = int(h_small * 0.11)
head_rx = int(w_small * 0.03)  # very small inner radius
head_ry = int(h_small * 0.04)  # very small inner radius
cv2.ellipse(mask, (head_x, head_y), (head_rx, head_ry), 0, 0, 360, cv2.GC_FGD, -1)

# Sure foreground: ONLY the absolute inner core of torso
body_x1 = int(w_small * 0.42)
body_x2 = int(w_small * 0.58)
body_y1 = int(h_small * 0.25)
body_y2 = int(h_small * 0.80)
mask[body_y1:body_y2, body_x1:body_x2] = cv2.GC_FGD

# Run GrabCut
print("Running refined GrabCut with small sure-foreground core...")
bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)
cv2.grabCut(img_small, mask, None, bgdModel, fgdModel, 8, cv2.GC_INIT_WITH_MASK)

# Modify mask: 0 and 2 are background, 1 and 3 are foreground
mask2_small = np.where((mask == cv2.GC_BGD) | (mask == cv2.GC_PR_BGD), 0, 1).astype('uint8')

# Upscale the mask back to original size
mask2 = cv2.resize(mask2_small, (w, h), interpolation=cv2.INTER_NEAREST)

# Apply mask to original high-res image
fg = img * mask2[:, :, np.newaxis]

# Convert to BGRA
tmp = cv2.cvtColor(fg, cv2.COLOR_BGR2BGRA)
tmp[:, :, 3] = mask2 * 255

# Save output
output_path = '/Users/saigutala/Yashu-Site/yashu-subject.png'
cv2.imwrite(output_path, tmp)
print("Perfectly segmented image saved to:", output_path)
