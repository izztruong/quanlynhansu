-- Evaluation answers accept decimals (e.g. "7.5 giờ", "4.5 sao").
-- Widening INTEGER -> DOUBLE PRECISION preserves existing values.
ALTER TABLE "evaluation_answers" ALTER COLUMN "numberValue" SET DATA TYPE DOUBLE PRECISION;
