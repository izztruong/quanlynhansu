import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('123456', 10);

function dateOf(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  console.log('Đang xoá dữ liệu cũ...');
  await prisma.attendance.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.shiftDepartment.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.news.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.level.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();
  await prisma.branch.deleteMany();

  console.log('Đang tạo chi nhánh...');
  const branch = await prisma.branch.create({
    data: {
      name: 'Indoor Coffee Xuân La',
      address: 'Xuân La, Tây Hồ, Hà Nội',
    },
  });

  console.log('Đang tạo bộ phận...');
  const [phucVu, phaChe, quanLy] = await Promise.all([
    prisma.department.create({ data: { name: 'Phục vụ', description: 'Bộ phận phục vụ khách hàng' } }),
    prisma.department.create({ data: { name: 'Pha chế', description: 'Bộ phận pha chế đồ uống' } }),
    prisma.department.create({ data: { name: 'Quản lý', description: 'Bộ phận quản lý vận hành' } }),
  ]);

  console.log('Đang tạo chức vụ...');
  const positions = await Promise.all([
    prisma.position.create({
      data: {
        name: 'Chủ thương hiệu',
        description: 'Có toàn quyền trên hệ thống',
        accessScopes: ['CMS', 'HRM Chủ'],
      },
    }),
    prisma.position.create({
      data: {
        name: 'Quản lý nhân sự',
        description: 'Có toàn quyền trên hệ thống',
        accessScopes: ['CMS', 'iPOS HRM'],
      },
    }),
    prisma.position.create({
      data: {
        name: 'Nhân viên',
        description: 'Có quyền chấm công, xem lương, xem lịch làm việc của cá nhân',
        accessScopes: ['iPOS HRM'],
      },
    }),
    prisma.position.create({
      data: {
        name: 'Quản lý bộ phận',
        description: 'Có quyền trên bộ phận mà họ quản lý',
        accessScopes: ['CMS', 'iPOS HRM'],
      },
    }),
    prisma.position.create({
      data: {
        name: 'Quản lý vùng',
        description: 'Có toàn quyền trên các điểm bán hàng mà họ quản lý',
        accessScopes: ['CMS', 'iPOS HRM'],
        status: 'INACTIVE',
      },
    }),
    prisma.position.create({
      data: {
        name: 'Quản lý điểm bán hàng',
        description: 'Có toàn quyền trên các điểm bán hàng mà họ quản lý',
        accessScopes: ['CMS'],
      },
    }),
  ]);
  const [posChu, posQlns, posNhanVien, posQlbp] = positions;

  console.log('Đang tạo level...');
  const [level1, level2] = await Promise.all([
    prisma.level.create({ data: { name: 'Level 1', description: 'Nhân viên mới' } }),
    prisma.level.create({ data: { name: 'Level 2', description: 'Nhân viên chính thức' } }),
  ]);

  console.log('Đang tạo ca làm việc...');
  const shiftDefs = [
    { name: 'Full-time ca tối', startTime: '14:00', endTime: '23:00' },
    { name: 'sáng gãy', startTime: '07:00', endTime: '14:00' },
    { name: 'ca sáng chiều', startTime: '07:00', endTime: '18:00' },
    { name: 'Part-time ca sáng', startTime: '07:00', endTime: '12:00' },
    { name: 'Full-time ca sáng', startTime: '07:00', endTime: '16:00' },
    { name: 'Part-time ca chiều', startTime: '12:00', endTime: '18:00' },
    { name: 'Part-time ca tối', startTime: '18:00', endTime: '23:00' },
    { name: 'sáng chiều gãy', startTime: '07:00', endTime: '15:00' },
    { name: 'chiều tối gãy', startTime: '15:00', endTime: '23:00' },
    { name: 'Ca bổ sung pha chế', startTime: '12:00', endTime: '23:00' },
  ];
  const shifts = await Promise.all(
    shiftDefs.map((s) => prisma.shift.create({ data: s }))
  );
  const shiftByName = Object.fromEntries(shifts.map((s) => [s.name, s]));

  console.log('Đang tạo nhân viên...');
  const employeeDefs = [
    { code: 'NV0001', name: 'Nguyễn Việt Hưng', phone: '0901234501', departmentId: phucVu.id, positionId: posNhanVien.id, levelId: level2.id },
    { code: 'NV0002', name: 'Phạm Minh Châu', phone: '0901234502', departmentId: phucVu.id, positionId: posNhanVien.id, levelId: level1.id, employeeType: 'PART_TIME' as const },
    { code: 'NV0003', name: 'Đoàn Ngân', phone: '0901234503', departmentId: phucVu.id, positionId: posNhanVien.id, levelId: level1.id, employeeType: 'PART_TIME' as const },
    { code: 'NV0004', name: 'Bùi Chi', phone: '0901234504', departmentId: quanLy.id, positionId: posQlbp.id, levelId: level2.id },
    { code: 'NV0009', name: 'Bùi Văn Bào', phone: '0901234505', departmentId: phucVu.id, positionId: posNhanVien.id, levelId: level1.id },
    { code: 'NV0023', name: 'Đoàn Ngân', phone: '0901234506', departmentId: phaChe.id, positionId: posNhanVien.id, levelId: level1.id, employeeType: 'PART_TIME' as const },
    { code: 'NV0030', name: 'Nguyễn Duy Anh', phone: '0901234507', departmentId: phaChe.id, positionId: posNhanVien.id, levelId: level2.id },
    { code: 'NV0033', name: 'Nguyễn Yến', phone: '0901234508', departmentId: phucVu.id, positionId: posNhanVien.id, levelId: level1.id },
    { code: 'NV0034', name: 'Nguyễn Vũ Minh Quang', phone: '0901234509', departmentId: phucVu.id, positionId: posNhanVien.id, levelId: level1.id, employeeType: 'PART_TIME' as const },
    { code: 'NV0035', name: 'Trần Trang', phone: '0901234510', departmentId: phucVu.id, positionId: posNhanVien.id, levelId: level1.id, employeeType: 'PART_TIME' as const },
    { code: 'NV0036', name: 'Lê Hồng Khanh', phone: '0901234511', departmentId: quanLy.id, positionId: posQlns.id, levelId: level2.id },
    { code: 'NV0000', name: 'Nguyễn Thái', phone: '0901234500', departmentId: quanLy.id, positionId: posChu.id, levelId: level2.id },
  ];

  const employees = await Promise.all(
    employeeDefs.map((e) =>
      prisma.employee.create({
        data: {
          code: e.code,
          name: e.name,
          phone: e.phone,
          branchId: branch.id,
          departmentId: e.departmentId,
          positionId: e.positionId,
          levelId: e.levelId,
          employeeType: e.employeeType ?? 'FULL_TIME',
          email: `${e.code.toLowerCase()}@hrm.local`,
          passwordHash: DEFAULT_PASSWORD_HASH,
        },
      })
    )
  );
  const empByName = Object.fromEntries(employees.map((e) => [`${e.code}-${e.name}`, e]));
  const findEmp = (code: string) => employees.find((e) => e.code === code)!;

  console.log('Đang tạo lịch làm việc tuần hiện tại...');
  // Tuần 20/07/2026 (T2) - 26/07/2026 (CN)
  const scheduleDefs: { code: string; shift: string; day: number }[] = [
    { code: 'NV0034', shift: 'Part-time ca chiều', day: 20 },
    { code: 'NV0035', shift: 'chiều tối gãy', day: 20 },
    { code: 'NV0023', shift: 'chiều tối gãy', day: 21 },
    { code: 'NV0035', shift: 'chiều tối gãy', day: 21 },
    { code: 'NV0002', shift: 'Part-time ca sáng', day: 22 },
    { code: 'NV0003', shift: 'Part-time ca chiều', day: 22 },
    { code: 'NV0035', shift: 'chiều tối gãy', day: 22 },
    { code: 'NV0001', shift: 'sáng chiều gãy', day: 23 },
    { code: 'NV0009', shift: 'sáng chiều gãy', day: 23 },
    { code: 'NV0003', shift: 'Ca bổ sung pha chế', day: 23 },
    { code: 'NV0001', shift: 'sáng chiều gãy', day: 24 },
    { code: 'NV0002', shift: 'Part-time ca sáng', day: 24 },
    { code: 'NV0009', shift: 'sáng chiều gãy', day: 24 },
    { code: 'NV0034', shift: 'Part-time ca tối', day: 24 },
    { code: 'NV0003', shift: 'Ca bổ sung pha chế', day: 24 },
  ];

  await Promise.all(
    scheduleDefs.map(({ code, shift, day }) =>
      prisma.schedule.create({
        data: {
          employeeId: findEmp(code).id,
          shiftId: shiftByName[shift].id,
          date: dateOf(2026, 7, day),
        },
      })
    )
  );

  console.log('Đang tạo chấm công...');
  const attendanceDefs: {
    code: string;
    day: number;
    checkIn?: string;
    checkOut?: string;
    status: 'ON_TIME' | 'LATE' | 'MISSED_CHECKIN' | 'MISSED_CHECKOUT' | 'NOT_YET' | 'PENDING_APPROVAL' | 'ON_LEAVE';
  }[] = [
    { code: 'NV0004', day: 22, checkIn: '11:48', checkOut: '23:03', status: 'PENDING_APPROVAL' },
    { code: 'NV0001', day: 23, checkIn: '07:20', status: 'MISSED_CHECKOUT' },
    { code: 'NV0009', day: 20, checkIn: '07:10', checkOut: '15:00', status: 'LATE' },
    { code: 'NV0009', day: 21, checkIn: '07:16', checkOut: '15:00', status: 'LATE' },
    { code: 'NV0009', day: 22, checkIn: '07:11', checkOut: '14:42', status: 'LATE' },
    { code: 'NV0009', day: 23, checkIn: '07:11', checkOut: '12:06', status: 'LATE' },
    { code: 'NV0003', day: 20, checkIn: '22:04', checkOut: '00:04', status: 'PENDING_APPROVAL' },
    { code: 'NV0003', day: 21, checkIn: '14:58', checkOut: '23:19', status: 'ON_TIME' },
    { code: 'NV0003', day: 22, checkIn: '12:00', checkOut: '18:00', status: 'MISSED_CHECKIN' },
    { code: 'NV0003', day: 23, checkIn: '11:56', checkOut: '23:00', status: 'ON_TIME' },
    { code: 'NV0030', day: 20, checkIn: '14:57', checkOut: '23:50', status: 'ON_TIME' },
    { code: 'NV0030', day: 21, checkIn: '17:57', checkOut: '23:19', status: 'LATE' },
    { code: 'NV0030', day: 22, checkIn: '14:47', checkOut: '23:04', status: 'ON_TIME' },
    { code: 'NV0033', day: 20, checkIn: '07:33', checkOut: '15:08', status: 'LATE' },
    { code: 'NV0033', day: 21, checkIn: '07:08', status: 'MISSED_CHECKOUT' },
    { code: 'NV0033', day: 22, checkIn: '15:00', checkOut: '23:00', status: 'ON_TIME' },
    { code: 'NV0001', day: 24, status: 'NOT_YET' },
  ];

  await Promise.all(
    attendanceDefs.map(({ code, day, checkIn, checkOut, status }) => {
      const date = dateOf(2026, 7, day);
      const toDateTime = (hhmm?: string) =>
        hhmm
          ? new Date(2026, 6, day, Number(hhmm.split(':')[0]), Number(hhmm.split(':')[1]))
          : undefined;
      return prisma.attendance.create({
        data: {
          employeeId: findEmp(code).id,
          date,
          checkIn: toDateTime(checkIn),
          checkOut: toDateTime(checkOut),
          status,
        },
      });
    })
  );

  console.log('Đang tạo tin tức...');
  await Promise.all([
    prisma.news.create({
      data: {
        title: 'Sổ tay phòng, chống dịch Covid-19 tại cơ sở kinh doanh dịch vụ ăn, uống phục vụ tại chỗ.',
        viewCount: 0,
      },
    }),
    prisma.news.create({
      data: {
        title: 'THÔNG BÁO DANH SÁCH NHÂN SỰ TĂNG BẬC LƯƠNG CỐNG HIẾN THÁNG 06/2026',
        viewCount: 42,
      },
    }),
    prisma.news.create({
      data: {
        title: 'THÔNG BÁO KẾT QUẢ ĐÁNH GIÁ NĂNG LỰC ĐỢT 3-QUÝ 2.2026',
        viewCount: 46,
      },
    }),
    prisma.news.create({
      data: {
        title: 'THÔNG BÁO CÁCH TÍNH ĐIỂM NĂNG LỰC KỲ THI ĐÁNH GIÁ NĂNG LỰC ĐỢT 3-QUÝ 2.2026 CỦA INDOOR COFFEE',
        viewCount: 39,
      },
    }),
    prisma.news.create({
      data: {
        title: 'THÔNG BÁO TỔ CHỨC KỲ THI ĐÁNH GIÁ NĂNG LỰC NHÂN SỰ LẦN 3 TOÀN HỆ THỐNG',
        viewCount: 41,
      },
    }),
  ]);

  console.log('Seed hoàn tất.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
