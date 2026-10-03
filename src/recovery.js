export const CUSTOM = "Custom question";

export const QUESTIONS = [
  "Favorite word",
  "Favorite food",
  "Favorite place",
  "Childhood nickname",
  "Favorite character or hero",
  CUSTOM,
];

export const emptyRecovery = () => ({
  choice: QUESTIONS[0],
  custom: "",
  answer: "",
  confirm: "",
  ack: false,
});

export const recoveryQuestion = (rec) =>
  rec.choice === CUSTOM ? rec.custom.trim() : rec.choice;

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

export const validateRecovery = (rec, masterKey = "") => {
  if (!recoveryQuestion(rec)) return "Write your custom question.";
  if (normalize(rec.answer).length < 3) {
    return "Recovery answer must be at least 3 characters.";
  }
  if (normalize(rec.answer) !== normalize(rec.confirm)) {
    return "Both recovery answers must match.";
  }
  if (masterKey && normalize(rec.answer) === normalize(masterKey)) {
    return "Recovery answer must be different from the master key.";
  }
  if (!rec.ack) return "Confirm that you will remember your recovery answer.";
  return "";
};