import json
import os
from typing import Dict, Any
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
    Business: API для управления пользователями и их статистикой
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с данными пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            telegram_id = params.get('telegram_id')
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'telegram_id is required'}),
                    'isBase64Encoded': False
                }
            
            query = '''
                SELECT id, telegram_id, username, level, xp, total_completed, streak, created_at
                FROM users 
                WHERE telegram_id = %s
            '''
            cursor.execute(query, (telegram_id,))
            user = cursor.fetchone()
            
            if not user:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            user_data = {
                'id': user['id'],
                'telegram_id': user['telegram_id'],
                'username': user['username'],
                'level': user['level'],
                'xp': user['xp'],
                'totalCompleted': user['total_completed'],
                'streak': user['streak'],
                'createdAt': user['created_at'].isoformat() if user['created_at'] else None
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'user': user_data}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            telegram_id = body_data.get('telegram_id')
            username = body_data.get('username')
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'telegram_id is required'}),
                    'isBase64Encoded': False
                }
            
            query = '''
                INSERT INTO users (telegram_id, username)
                VALUES (%s, %s)
                ON CONFLICT (telegram_id) DO UPDATE 
                SET username = EXCLUDED.username
                RETURNING id, telegram_id, username, level, xp, total_completed, streak, created_at
            '''
            cursor.execute(query, (telegram_id, username))
            user = cursor.fetchone()
            conn.commit()
            
            user_data = {
                'id': user['id'],
                'telegram_id': user['telegram_id'],
                'username': user['username'],
                'level': user['level'],
                'xp': user['xp'],
                'totalCompleted': user['total_completed'],
                'streak': user['streak'],
                'createdAt': user['created_at'].isoformat()
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'user': user_data}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            user_id = body_data.get('user_id')
            xp_increment = body_data.get('xp_increment', 0)
            complete_task = body_data.get('complete_task', False)
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            if complete_task:
                query = '''
                    UPDATE users 
                    SET xp = xp + %s, 
                        total_completed = total_completed + 1,
                        level = CASE WHEN (xp + %s) >= (level * 100) THEN level + 1 ELSE level END
                    WHERE id = %s
                    RETURNING id, telegram_id, username, level, xp, total_completed, streak
                '''
                cursor.execute(query, (xp_increment, xp_increment, user_id))
            else:
                query = '''
                    UPDATE users 
                    SET xp = xp + %s,
                        level = CASE WHEN (xp + %s) >= (level * 100) THEN level + 1 ELSE level END
                    WHERE id = %s
                    RETURNING id, telegram_id, username, level, xp, total_completed, streak
                '''
                cursor.execute(query, (xp_increment, xp_increment, user_id))
            
            user = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'user': dict(user)}),
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
