from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
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
def create_problem(
    *,
    db: Session = Depends(deps.get_db),
    problem_in: schemas.ProblemCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Create new problem (Admin only)."""
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
def update_problem(
    *,
    db: Session = Depends(deps.get_db),
    problem_id: UUID,
    problem_in: schemas.ProblemUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Update a problem (Admin only)."""
    problem = crud.problem.get(db, id=problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
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
def create_test_case(
    *,
    db: Session = Depends(deps.get_db),
    problem_id: UUID,
    test_case_in: schemas.TestCaseCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Create a test case for a problem (Admin only)."""
    problem = crud.problem.get(db, id=problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
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
