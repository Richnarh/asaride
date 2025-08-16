import { Employee } from '../entities/Employee';
import { Repository } from 'typeorm';

interface EmployeeData {
  name?: string;
  position?: string;
  salary?: number;
}

export class EmployeeService {
  constructor(private employeeRepository: Repository<Employee>) {}

  async createEmployee(data: EmployeeData) {
    const employee = new Employee();
    employee.name = data.name!;
    // employee.position = data.position!;
    // employee.salary = data.salary!;
    return await this.employeeRepository.save(employee);
  }

  async getAllEmployees() {
    return await this.employeeRepository.find();
  }

  async getEmployeeById(id: string) {
    return await this.employeeRepository.findOneBy({ id });
  }

  async updateEmployee(id: string, data: EmployeeData) {
    const employee = await this.employeeRepository.findOneBy({ id });
    if (!employee) {
      return null;
    }
    if (data.name !== undefined) employee.name = data.name;
    // if (data.position !== undefined) employee.position = data.position;
    // if (data.salary !== undefined) employee.salary = data.salary;
    return await this.employeeRepository.save(employee);
  }

  async deleteEmployee(id: string) {
    const employee = await this.employeeRepository.findOneBy({ id });
    if (!employee) {
      return false;
    }
    await this.employeeRepository.remove(employee);
    return true;
  }
}