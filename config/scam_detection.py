import re
import sys
# Suspicious keywords/phrases
suspicious_phrases = [
    "non-custom product",
    "urgent sale",
    "cheap price",
    "contact on Whatsapp",
    "Affordable iPhones",
    "DM me for details",
    "Text only, no calls"
]


# Preprocess function


def preprocess(text):
    """
    Cleans and preprocesses the input text.
    """
    text = text.lower()  # Convert to lowercase
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    text = re.sub(r'\s+', ' ', text).strip()  # Remove extra spaces
    return text

# Sequential match detection


def detect_suspicious(description, phrases, threshold_ratio=0.66):
    """
    Detect suspicious phrases by checking sequential word order matches.
    """
    for phrase in phrases:
        # Check for exact match
        if phrase in description:
            return True

        # Split phrase and description into word lists
        phrase_words = phrase.split()
        description_words = description.split()

        # Sequential matching logic
        match_count = 0
        description_idx = 0

        for word in phrase_words:
            while description_idx < len(description_words):
                if word == description_words[description_idx]:
                    match_count += 1
                    description_idx += 1
                    break
                description_idx += 1

        # Calculate sequential match ratio
        match_ratio = match_count / len(phrase_words)

        # Debugging: Print intermediate results
        # print(
        #     f"Phrase: {phrase}, Match Count: {match_count}, Match Ratio: {match_ratio:.2f}")

        # Flag as suspicious if match ratio meets/exceeds threshold
        if match_ratio >= threshold_ratio:
            return True

    return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Description argument is missing")
        sys.exit(1)

    # Get the description from the command-line argument
    ad_description = sys.argv[1]

    # Preprocess and detect
    ad_description = preprocess(ad_description)
    suspicious_phrases = [preprocess(phrase) for phrase in suspicious_phrases]
    suspicious_detected = detect_suspicious(ad_description, suspicious_phrases)

    # Output the result
    if suspicious_detected:
        print("Suspicious Ad Detected!")
    else:
        print("Ad Seems Genuine.")
