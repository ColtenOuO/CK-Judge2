from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from uuid import UUID

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.ProblemOut])
def read_problems(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve problems."""
    problems = crud.problem.get_multi(db, skip=skip, limit=limit)
    return problems

@router.post("/", response_model=schemas.ProblemOut, status_code=status.HTTP_201_CREATED)
async def create_problem(
    *,
    db: Session = Depends(deps.get_db),
    title: str = Form(...),
    description: str = Form(...),
    input_description: str = Form(...),
    output_description: str = Form(...),
    time_limit: int = Form(1000),
    memory_limit: int = Form(256),
    difficulty: str = Form("Easy"),
    is_active: bool = Form(True),
    is_special_judge: bool = Form(False),
    is_partial: bool = Form(False),
    main_file: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Create new problem (Admin only)."""
    main_code = None
    if main_file:
        content = await main_file.read()
        main_code = content.decode().replace('\r\n', '\n')
    
    problem_in = schemas.ProblemCreate(
        title=title,
        description=description,
        input_description=input_description,
        output_description=output_description,
        time_limit=time_limit,
        memory_limit=memory_limit,
        difficulty=difficulty,
        is_active=is_active,
        is_special_judge=is_special_judge,
        is_partial=is_partial,
        main_code=main_code
    )
    problem = crud.problem.create(db, obj_in=problem_in)
    return problem

@router.get("/{problem_id}", response_model=schemas.ProblemOut)
def read_problem(
    *,
    db: Session = Depends(deps.get_db),
    problem_id: UUID,
) -> Any:
    """Get problem by ID."""
    problem = crud.problem.get(db, id=problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@router.put("/{problem_id}", response_model=schemas.ProblemOut)
async def update_problem(
    *,
    db: Session = Depends(deps.get_db),
    problem_id: UUID,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    input_description: Optional[str] = Form(None),
    output_description: Optional[str] = Form(None),
    time_limit: Optional[int] = Form(None),
    memory_limit: Optional[int] = Form(None),
    difficulty: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    is_special_judge: Optional[bool] = Form(None),
    is_partial: Optional[bool] = Form(None),
    main_file: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Update a problem (Admin only)."""
    problem = crud.problem.get(db, id=problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    update_data = {}
    for key, value in {
        "title": title,
        "description": description,
        "input_description": input_description,
        "output_description": output_description,
        "time_limit": time_limit,
        "memory_limit": memory_limit,
        "difficulty": difficulty,
        "is_active": is_active,
        "is_special_judge": is_special_judge,
        "is_partial": is_partial,
    }.items():
        if value is not None:
            update_data[key] = value

    if main_file:
        content = await main_file.read()
        update_data["main_code"] = content.decode().replace('\r\n', '\n')
    
    problem_in = schemas.ProblemUpdate(**update_data)
    problem = crud.problem.update(db, db_obj=problem, obj_in=problem_in)
    return problem

@router.delete("/{problem_id}", response_model=schemas.ProblemOut)
def delete_problem(
    *,
    db: Session = Depends(deps.get_db),
    problem_id: UUID,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Delete a problem (Admin only)."""
    problem = crud.problem.get(db, id=problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return crud.problem.remove(db, id=problem_id)

# Test Case Endpoints

@router.post("/{problem_id}/test_cases", response_model=schemas.TestCaseOut, status_code=status.HTTP_201_CREATED)
async def create_test_case(
    *,
    db: Session = Depends(deps.get_db),
    problem_id: UUID,
    input_file: UploadFile = File(...),
    output_file: UploadFile = File(...),
    is_sample: bool = Form(False),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Create a test case for a problem (Admin only)."""
    problem = crud.problem.get(db, id=problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Read and normalize EOL
    input_content = await input_file.read()
    output_content = await output_file.read()
    
    input_data = input_content.decode().replace('\r\n', '\n')
    output_data = output_content.decode().replace('\r\n', '\n')
    
    test_case_in = schemas.TestCaseCreate(
        input_data=input_data,
        output_data=output_data,
        is_sample=is_sample
    )
    
    return crud.test_case.create(db, obj_in=test_case_in, problem_id=problem_id)

@router.get("/{problem_id}/test_cases", response_model=List[schemas.TestCaseOut])
def read_test_cases(
    *,
    db: Session = Depends(deps.get_db),
    problem_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """List test cases for a problem (Admin only)."""
    problem = crud.problem.get(db, id=problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return crud.test_case.get_by_problem(db, problem_id=problem_id, skip=skip, limit=limit)
