import pytesseract
import cv2

originalImage = cv2.imread("T.png")
grayImage = cv2.cvtColor(originalImage, cv2.COLOR_BGR2GRAY)
_,grayImage = cv2.threshold(grayImage, 254, 255, cv2.THRESH_BINARY_INV)
result = pytesseract.image_to_string(grayImage)
print(result)
 
cv2.imshow("Original Image", originalImage)
cv2.imshow("Optimized Image", grayImage)
cv2.waitKey(0)