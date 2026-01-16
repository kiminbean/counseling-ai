import unittest
from models.emotion_classifier import EmotionClassifier

class TestCounselor(unittest.TestCase):
    def setUp(self):
        self.classifier = EmotionClassifier()

    def test_emotion_prediction(self):
        result = self.classifier.predict("너무 힘들어요")
        self.assertEqual(result.emotion, "sadness")

if __name__ == '__main__':
    unittest.main()
