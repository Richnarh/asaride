import { Request, Response } from 'express';
import { EmployeeService } from '../services/EmployeeService.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EmployeeCreateDto } from '../dto/EmployeeCreateDto.js';
import { EmployeeUpdateDto } from '../dto/EmployeeUpdateDto.js';

export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  async createEmployee(req: Request, res: Response) {
    try {
      const dto = plainToInstance(EmployeeCreateDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.map(e => e.constraints) });
      }
      const employee = await this.employeeService.createEmployee({ name: dto.name, position: dto.position, salary: dto.salary });
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Error creating employee', error });
    }
  }

  async getAllEmployees(req: Request, res: Response) {
    try {
      const employees = await this.employeeService.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching employees', error });
    }
  }

  async getEmployeeById(req: Request, res: Response) {
    try {
      const employee = await this.employeeService.getEmployeeById(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching employee', error });
    }
  }

  async updateEmployee(req: Request, res: Response) {
    try {
      const dto = plainToInstance(EmployeeUpdateDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.map(e => e.constraints) });
      }
      const employee = await this.employeeService.updateEmployee(req.params.id, { name: dto.name, position: dto.position, salary: dto.salary });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Error updating employee', error });
    }
  }

  async deleteEmployee(req: Request, res: Response) {
    try {
      const success = await this.employeeService.deleteEmployee(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting employee', error });
    }
  }
}