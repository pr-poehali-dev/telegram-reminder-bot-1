import json
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    '''
    Создает подключение к базе данных PostgreSQL
    Returns: соединение с БД
    '''
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления заданиями пользователей
    Args: event - dict с httpMethod, body, queryStringParameters, pathParams
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с заданиями или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id')
            status = params.get('status', 'active')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            query = '''
                SELECT id, user_id, title, description, interval, assigned_to, 
                       status, priority, reminder_count, created_at, completed_at
                FROM tasks 
                WHERE user_id = %s AND status = %s
                ORDER BY created_at DESC
            '''
            cursor.execute(query, (user_id, status))
            tasks = cursor.fetchall()
            
            tasks_list = []
            for task in tasks:
                tasks_list.append({
                    'id': str(task['id']),
                    'title': task['title'],
                    'description': task['description'],
                    'interval': task['interval'],
                    'assignedTo': task['assigned_to'],
                    'status': task['status'],
                    'priority': task['priority'],
                    'reminderCount': task['reminder_count'],
                    'createdAt': task['created_at'].isoformat() if task['created_at'] else None,
                    'completedAt': task['completed_at'].isoformat() if task['completed_at'] else None
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'tasks': tasks_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            user_id = body_data.get('user_id')
            title = body_data.get('title')
            description = body_data.get('description', '')
            interval = body_data.get('interval')
            assigned_to = body_data.get('assigned_to')
            priority = body_data.get('priority', 'medium')
            
            if not user_id or not title or not interval:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id, title and interval are required'}),
                    'isBase64Encoded': False
                }
            
            query = '''
                INSERT INTO tasks (user_id, title, description, interval, assigned_to, priority, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'active')
                RETURNING id, title, description, interval, assigned_to, status, priority, reminder_count, created_at
            '''
            cursor.execute(query, (user_id, title, description, interval, assigned_to, priority))
            task = cursor.fetchone()
            conn.commit()
            
            task_data = {
                'id': str(task['id']),
                'title': task['title'],
                'description': task['description'],
                'interval': task['interval'],
                'assignedTo': task['assigned_to'],
                'status': task['status'],
                'priority': task['priority'],
                'reminderCount': task['reminder_count'],
                'createdAt': task['created_at'].isoformat()
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'task': task_data}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParams', {}) or {}
            task_id = path_params.get('id')
            body_data = json.loads(event.get('body', '{}'))
            
            if not task_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'task_id is required'}),
                    'isBase64Encoded': False
                }
            
            status = body_data.get('status')
            
            if status == 'completed':
                query = '''
                    UPDATE tasks 
                    SET status = 'completed', completed_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, status, completed_at
                '''
                cursor.execute(query, (task_id,))
            else:
                query = '''
                    UPDATE tasks 
                    SET status = %s
                    WHERE id = %s
                    RETURNING id, status
                '''
                cursor.execute(query, (status, task_id))
            
            task = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if not task:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Task not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'task': dict(task)}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
