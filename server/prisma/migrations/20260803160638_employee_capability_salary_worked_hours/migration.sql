-- Lương năng lực (NL) + số giờ đã làm. Cả hai nullable nên nhân viên
-- hiện có không bị ảnh hưởng, giá trị mặc định để trống.
ALTER TABLE "employees"
  ADD COLUMN "capabilitySalary" INTEGER,
  ADD COLUMN "workedHours" DOUBLE PRECISION;
