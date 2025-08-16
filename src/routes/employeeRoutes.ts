import { Router } from 'express';
import { DataSource } from 'typeorm';
import { EmployeeController } from '../controllers/EmployeeController';
import { EmployeeService } from '../services/EmployeeService';
import { Employee } from '../entities/Employee';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

export function setupEmployeeRoutes(dataSource: DataSource) {
  const employeeRepository = dataSource.getRepository(Employee);
  const employeeService = new EmployeeService(employeeRepository);
  const employeeController = new EmployeeController(employeeService);

  // Protect all employee routes with JWT middleware
  router.use(authenticateToken);

  router.post('/', (req, res) => employeeController.createEmployee(req, res));
  router.get('/', (req, res) => employeeController.getAllEmployees(req, res));
  router.get('/:id', (req, res) => employeeController.getEmployeeById(req, res));
  router.put('/:id', (req, res) => employeeController.updateEmployee(req, res));
  router.delete('/:id', (req, res) => employeeController.deleteEmployee(req, res));

  return router;
}